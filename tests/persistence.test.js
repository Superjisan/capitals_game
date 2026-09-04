import { assertEquals, assertNotEquals } from 'jsr:@std/assert@1';
import { MODE_DATASETS } from '../js/game_state.js';
import { setupDom, importGame } from './support/env.js';
import { answerCurrentCountry } from './support/play.js';

const oceaniaCapitals = MODE_DATASETS.oceania;

Deno.test('a fresh visit with no saved state starts a new World game', async () => {
  setupDom();
  const game = await importGame();
  assertEquals(document.getElementById('world').classList.contains('active'), true);
  assertNotEquals(document.getElementById('country').innerText, '');
});

Deno.test('corrupted localStorage is ignored, falling back to a fresh game', async () => {
  setupDom();
  localStorage.setItem('capitalsGameState', '{ not valid json');
  const game = await importGame();
  assertEquals(document.getElementById('world').classList.contains('active'), true);
});

Deno.test('progress survives leaving and reopening the tab', async () => {
  setupDom();
  let game = await importGame();
  game.switchMode('oceania');
  answerCurrentCountry(game, oceaniaCapitals);
  answerCurrentCountry(game, oceaniaCapitals, { skip: true });

  const countryBeforeReload = document.getElementById('country').innerText;
  const scoreBeforeReload = document.getElementById('score').innerText;

  // simulate closing the tab and reopening it later: fresh document and fresh
  // module instance, but the same underlying localStorage.
  setupDom({ resetStorage: false });
  game = await importGame();

  assertEquals(document.getElementById('oceania').classList.contains('active'), true);
  // jsdom's innerText doesn't stringify numeric assignments the way real browsers do
  assertEquals(String(document.getElementById('progress-value').innerText), '2');
  assertEquals(String(document.getElementById('total-countries').innerText), String(Object.keys(oceaniaCapitals).length));
  assertEquals(document.getElementById('score').innerText, scoreBeforeReload);
  assertEquals(document.getElementById('country').innerText, countryBeforeReload);
  assertEquals(document.querySelectorAll('#answers-body tr').length, 2);
  assertEquals(document.getElementById('share').hidden, true);
});

Deno.test('a finished game is restored with the share button already visible', async () => {
  setupDom();
  let game = await importGame();
  game.switchMode('oceania');
  const total = Object.keys(oceaniaCapitals).length;
  for (let i = 0; i < total; i++) {
    answerCurrentCountry(game, oceaniaCapitals);
  }
  assertEquals(document.getElementById('share').hidden, false);

  setupDom({ resetStorage: false });
  game = await importGame();

  assertEquals(document.getElementById('share').hidden, false);
  assertEquals(String(document.getElementById('progress-value').innerText), String(total));
  assertEquals(document.querySelectorAll('#answers-body tr').length, total);
});
