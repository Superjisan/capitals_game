import { assert, assertEquals } from 'jsr:@std/assert@1';
import { setupDom, importGame } from './support/env.js';
import { populateCapitalsDatalist } from '../js/datalist.js';
import { MODE_DATASETS } from '../js/game_state.js';

const progress = () => String(document.getElementById('progress-value').innerText);
const score = () => document.getElementById('score').innerText;

function type(value) {
  const input = document.getElementById('answer');
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

// checkAnswer reads the country straight off #country, so overriding it pins
// the test to one country instead of whatever the game picked at random.
function playCountry(country) {
  document.getElementById('country').innerText = country;
  return country;
}

Deno.test('typing the correct capital submits it without pressing enter', async () => {
  setupDom();
  const game = await importGame();
  playCountry('France');

  type('Paris');

  assertEquals(progress(), '1');
  assertEquals(score(), 'Score: 1');
  assertEquals(game.getState().answersGiven, ['Paris']);
});

Deno.test('eager acceptance ignores case and surrounding whitespace', async () => {
  setupDom();
  await importGame();
  playCountry('France');

  type('  pARIs  ');

  assertEquals(progress(), '1');
  assertEquals(score(), 'Score: 1');
});

Deno.test('an accepted alternate spelling submits eagerly too', async () => {
  setupDom();
  await importGame();
  playCountry('Albania');

  type('Tirane');

  assertEquals(progress(), '1');
  assertEquals(score(), 'Score: 1');
});

Deno.test('any one of a multi-capital country\'s capitals submits eagerly', async () => {
  setupDom();
  await importGame();
  playCountry('Bolivia');

  type('Sucre');

  assertEquals(progress(), '1');
  assertEquals(score(), 'Score: 1');
});

Deno.test('typing towards the answer does not submit early', async () => {
  setupDom();
  await importGame();
  playCountry('France');

  for (const partial of ['P', 'Pa', 'Par', 'Pari']) {
    type(partial);
    assertEquals(progress(), '0', `"${partial}" is not the capital yet`);
  }

  type('Paris');
  assertEquals(progress(), '1');
});

Deno.test('a wrong answer still waits for submit', async () => {
  setupDom();
  await importGame();
  playCountry('France');

  type('Lyon');

  assertEquals(progress(), '0');
  assertEquals(score(), 'Score: 0');
});

Deno.test('an eagerly accepted answer submits exactly once', async () => {
  setupDom();
  const game = await importGame();
  playCountry('France');

  type('Paris');

  assertEquals(progress(), '1', 'the input event checkAnswer re-dispatches must not submit again');
  assertEquals(game.getState().countriesPlayed, ['France']);
  assertEquals(document.querySelectorAll('#answers-body tr').length, 1);
});

Deno.test('eager acceptance clears the input and closes the dropdown', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist(MODE_DATASETS.world);
  playCountry('France');

  type('Pari');
  assertEquals(document.getElementById('answer-suggestions').hidden, false);

  type('Paris');

  assertEquals(document.getElementById('answer').value, '');
  assertEquals(document.getElementById('answer-suggestions').hidden, true);
});

Deno.test('picking the correct capital from the dropdown submits it', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist(MODE_DATASETS.world);
  playCountry('France');

  const input = type('Pari');
  const [firstSuggestion] = document.querySelectorAll('.capital-suggestion');
  assertEquals(firstSuggestion.textContent, 'Paris');
  firstSuggestion.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event('input', { bubbles: true }));

  assertEquals(progress(), '1');
  assertEquals(score(), 'Score: 1');
});

Deno.test('eager acceptance moves the game on to a new country', async () => {
  setupDom();
  await importGame();
  playCountry('France');

  type('Paris');

  const nextCountry = document.getElementById('country').innerText;
  assert(nextCountry, 'a new country should be in play');
  assert(nextCountry !== 'France', 'the answered country should not still be showing');
});

Deno.test('an empty input never submits', async () => {
  setupDom();
  await importGame();
  playCountry('France');

  type('   ');

  assertEquals(progress(), '0');
});
