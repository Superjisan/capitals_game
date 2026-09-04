import { assertEquals, assertMatch } from 'jsr:@std/assert@1';
import { MODE_DATASETS } from '../js/game_state.js';
import { setupDom, importGame } from './support/env.js';
import { answerCurrentCountry } from './support/play.js';

const oceaniaCapitals = MODE_DATASETS.oceania;
const OCEANIA_COUNT = Object.keys(oceaniaCapitals).length;

Deno.test('switching to a continent resets progress and scopes the country pool', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');

  assertEquals(document.getElementById('oceania').classList.contains('active'), true);
  // jsdom's innerText doesn't stringify numeric assignments the way real browsers do
  assertEquals(String(document.getElementById('total-countries').innerText), String(OCEANIA_COUNT));
  assertEquals(String(document.getElementById('progress-value').innerText), '0');
  assertEquals(document.getElementById('share').hidden, true);
  assertEquals(oceaniaCapitals[document.getElementById('country').innerText] !== undefined, true);
});

Deno.test('playing a full continent tracks score/progress and reveals share only at the end', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');

  answerCurrentCountry(game, oceaniaCapitals); // correct
  answerCurrentCountry(game, oceaniaCapitals, { skip: true }); // wrong
  // answer every country but the last one, checking share stays hidden throughout
  for (let answered = 2; answered < OCEANIA_COUNT - 1; answered++) {
    answerCurrentCountry(game, oceaniaCapitals);
    assertEquals(document.getElementById('share').hidden, true);
  }
  answerCurrentCountry(game, oceaniaCapitals); // the final country

  assertEquals(String(document.getElementById('progress-value').innerText), String(OCEANIA_COUNT));
  assertEquals(document.getElementById('score').innerText, `Score: ${OCEANIA_COUNT - 1}`);
  assertEquals(document.getElementById('share').hidden, false);
  assertEquals(document.querySelectorAll('#answers-body tr').length, OCEANIA_COUNT);
  assertMatch(document.getElementById('feedback').innerText, /Game over/);
});

Deno.test('buildResultsEmojiGrid mirrors the correct/wrong answer sequence', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');

  answerCurrentCountry(game, oceaniaCapitals, { skip: true });
  for (let i = 0; i < OCEANIA_COUNT - 1; i++) {
    answerCurrentCountry(game, oceaniaCapitals);
  }

  // spread to iterate by codepoint -- emoji are surrogate pairs, so .length/[i]
  // on the raw string would count UTF-16 code units instead of squares
  const squares = [...game.buildResultsEmojiGrid().replace(/\n/g, '')];
  assertEquals(squares.length, OCEANIA_COUNT);
  assertEquals(squares[0], '🟥');
  assertEquals(squares.slice(1).join(''), '🟩'.repeat(OCEANIA_COUNT - 1));
});

Deno.test('buildShareText includes the mode name and current score', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');
  answerCurrentCountry(game, oceaniaCapitals);

  const text = game.buildShareText();
  assertMatch(text, /Oceania/);
  assertMatch(text, new RegExp(`Score: 1/${OCEANIA_COUNT}`));
});

Deno.test('shareScore falls back gracefully when the Web Share and Clipboard APIs are unavailable', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');
  answerCurrentCountry(game, oceaniaCapitals);

  // jsdom implements neither API, matching real-world browsers that lack them.
  await game.shareScore();
  assertEquals(document.getElementById('share').innerText, 'Could not copy score');
});
