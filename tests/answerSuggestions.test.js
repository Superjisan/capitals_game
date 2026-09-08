import { assert, assertEquals } from 'jsr:@std/assert@1';
import { populateCapitalsDatalist } from '../js/datalist.js';
import { setupDom, importGame } from './support/env.js';

const optionValues = () =>
  [...document.querySelectorAll('#capitals-list option')].map((option) => option.value);

const suggestionLabels = () =>
  [...document.querySelectorAll('#answer-suggestions .capital-suggestion')]
    .map((button) => button.textContent);

function type(value) {
  const input = document.getElementById('answer');
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
}

function press(key) {
  document.getElementById('answer')
    .dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

Deno.test('the answer input drives the custom dropdown, not the native datalist', () => {
  setupDom();
  const input = document.getElementById('answer');

  assertEquals(input.getAttribute('list'), null, 'a list attribute would open a second, native dropdown');
  assertEquals(input.closest('#answer-wrapper')?.id, 'answer-wrapper');
  assertEquals(document.getElementById('answer-suggestions').hidden, true, 'the dropdown starts closed');
});

Deno.test('populateCapitalsDatalist includes the capital and its accepted aliases', () => {
  setupDom();
  populateCapitalsDatalist({ Albania: 'Tirana' });

  const values = optionValues();
  assertEquals(values.includes('Tirana'), true);
  assertEquals(values.includes('Tirane'), true);
});

Deno.test('populateCapitalsDatalist includes every capital of a country that has more than one', () => {
  setupDom();
  populateCapitalsDatalist({ Bolivia: ['La Paz', 'Sucre'] });

  assertEquals(optionValues(), ['La Paz', 'Sucre']);
});

Deno.test('populateCapitalsDatalist replaces the previous options instead of appending', () => {
  setupDom();
  populateCapitalsDatalist({ France: 'Paris' });
  populateCapitalsDatalist({ France: 'Paris' });

  assertEquals(optionValues(), ['Paris']);
});

Deno.test('suggestions filter below the input as the user types', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna', Laos: 'Vientiane', Brazil: 'Brasilia' });

  type('vien');

  assertEquals(document.getElementById('answer-suggestions').hidden, false);
  const labels = suggestionLabels();
  assertEquals(labels.includes('Vienna'), true);
  assertEquals(labels.includes('Vientiane'), true);
  assertEquals(labels.includes('Brasilia'), false);
});

Deno.test('an empty input closes the dropdown', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna' });

  type('vien');
  assertEquals(document.getElementById('answer-suggestions').hidden, false);

  type('   ');
  assertEquals(document.getElementById('answer-suggestions').hidden, true);
  assertEquals(suggestionLabels(), []);
});

Deno.test('the dropdown shows at most twelve matches', async () => {
  setupDom();
  await importGame();
  const manyCapitals = Object.fromEntries(
    Array.from({ length: 15 }, (_, i) => [`Country${i}`, `Springfield ${i}`])
  );
  populateCapitalsDatalist(manyCapitals);

  type('springfield');

  assertEquals(suggestionLabels().length, 12);
});

Deno.test('arrow keys walk the dropdown and enter picks the highlighted suggestion', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna', Laos: 'Vientiane' });

  const input = type('vien');
  const progressBefore = document.getElementById('progress-value').innerText;

  press('ArrowDown');
  assertEquals(document.querySelector('.capital-suggestion.active')?.textContent, 'Vienna');

  press('ArrowDown');
  assertEquals(document.querySelector('.capital-suggestion.active')?.textContent, 'Vientiane');

  press('ArrowUp');
  assertEquals(document.querySelector('.capital-suggestion.active')?.textContent, 'Vienna');

  press('Enter');
  assertEquals(input.value, 'Vienna');
  assertEquals(document.getElementById('answer-suggestions').hidden, true);
  assertEquals(
    document.getElementById('progress-value').innerText,
    progressBefore,
    'picking a suggestion should not also submit it'
  );
});

Deno.test('enter with the dropdown open but nothing highlighted takes the first match', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna', Laos: 'Vientiane' });

  const input = type('vien');
  press('Enter');

  assertEquals(input.value, 'Vienna');
  assertEquals(document.getElementById('answer-suggestions').hidden, true);
});

Deno.test('enter submits the answer once the dropdown is closed', async () => {
  setupDom();
  const game = await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna' });

  const country = document.getElementById('country').innerText;
  assert(country, 'the game should have a country in play');

  const input = document.getElementById('answer');
  input.value = game.getCapital(country);
  assertEquals(document.getElementById('answer-suggestions').hidden, true);

  press('Enter');

  assertEquals(String(document.getElementById('progress-value').innerText), '1');
  assertEquals(document.getElementById('score').innerText, 'Score: 1');
});

Deno.test('clicking a suggestion fills the input and closes the dropdown', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna', Laos: 'Vientiane' });

  const input = type('vien');
  const [firstSuggestion] = document.querySelectorAll('.capital-suggestion');
  firstSuggestion.dispatchEvent(new window.MouseEvent('mousedown', { bubbles: true, cancelable: true }));

  assertEquals(input.value, 'Vienna');
  assertEquals(document.getElementById('answer-suggestions').hidden, true);
});

Deno.test('submitting an answer clears the input and closes the dropdown', async () => {
  setupDom();
  const game = await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna' });

  type('vien');
  assertEquals(document.getElementById('answer-suggestions').hidden, false);

  game.checkAnswer();

  assertEquals(document.getElementById('answer').value, '');
  assertEquals(document.getElementById('answer-suggestions').hidden, true);
});

Deno.test('clicking outside the input closes the dropdown', async () => {
  setupDom();
  await importGame();
  populateCapitalsDatalist({ Austria: 'Vienna' });

  type('vien');
  assertEquals(document.getElementById('answer-suggestions').hidden, false);

  document.getElementById('country')
    .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

  assertEquals(document.getElementById('answer-suggestions').hidden, true);
});
