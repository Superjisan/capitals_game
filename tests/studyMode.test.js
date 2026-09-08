import { assert, assertEquals } from 'jsr:@std/assert@1';
import { setupDom, importGame } from './support/env.js';

const el = (id) => document.getElementById(id);
const text = (id) => String(el(id).innerText);
const activeImageToggle = () => document.querySelector('.image-toggle-btn.active')?.dataset.images;

async function startStudying() {
  setupDom();
  const game = await importGame();
  game.setStudyMode(true);
  return game;
}

Deno.test('study mode swaps the answering controls for the study controls', async () => {
  const game = await startStudying();

  assertEquals(el('answer-wrapper').hidden, true);
  assertEquals(el('answer').disabled, true);
  assertEquals(el('buttons-div').hidden, true);
  assertEquals(el('score').hidden, true);
  assertEquals(el('answers-table').hidden, true);
  assertEquals(el('share').hidden, true);

  assertEquals(el('reveal-answer').hidden, false);
  assertEquals(el('study-controls').hidden, false);
  assertEquals(el('image-toggle').hidden, false);
  assertEquals(el('input-div').dataset.mode, 'study');
  assertEquals(game.isStudying(), true);
});

Deno.test('leaving study mode puts the answering controls back', async () => {
  const game = await startStudying();
  game.setStudyMode(false);

  assertEquals(el('answer-wrapper').hidden, false);
  assertEquals(el('answer').disabled, false);
  assertEquals(el('buttons-div').hidden, false);
  assertEquals(el('score').hidden, false);
  assertEquals(el('answers-table').hidden, false);

  assertEquals(el('reveal-answer').hidden, true);
  assertEquals(el('study-controls').hidden, true);
  assertEquals(el('image-toggle').hidden, true);
  assertEquals(el('capital').hidden, true);
  assertEquals(el('input-div').dataset.mode, 'play');
  assertEquals(game.isStudying(), false);
});

Deno.test('study mode opens on the first country with its capital hidden', async () => {
  await startStudying();

  assertEquals(text('country'), 'Afghanistan');
  assertEquals(text('capital'), 'Kabul');
  assertEquals(el('capital').hidden, true, 'the capital is the thing being studied, so it starts hidden');
  assertEquals(text('progress-value'), '1');
  assertEquals(text('total-countries'), '201');
});

Deno.test('reveal shows the capital and toggles back to hidden', async () => {
  const game = await startStudying();
  const revealButton = el('reveal-answer');

  game.revealStudyCapital();
  assertEquals(el('capital').hidden, false);
  assertEquals(revealButton.classList.contains('revealed'), true);
  assertEquals(revealButton.textContent, '🙈 Hide');

  game.revealStudyCapital();
  assertEquals(el('capital').hidden, true);
  assertEquals(revealButton.classList.contains('revealed'), false);
  assertEquals(revealButton.textContent, '👁️ Reveal');
});

Deno.test('the arrows walk the country list and wrap at both ends', async () => {
  const game = await startStudying();

  game.moveStudyIndex(1);
  assertEquals(text('country'), 'Albania');
  assertEquals(text('capital'), 'Tirana');
  assertEquals(text('progress-value'), '2');

  game.moveStudyIndex(-1);
  assertEquals(text('country'), 'Afghanistan');
  assertEquals(text('progress-value'), '1');

  game.moveStudyIndex(-1);
  assertEquals(text('country'), 'Zimbabwe', 'stepping back from the first country wraps to the last');
  assertEquals(text('progress-value'), '201');

  game.moveStudyIndex(1);
  assertEquals(text('country'), 'Afghanistan', 'stepping forward from the last country wraps to the first');
});

Deno.test('moving on re-hides a revealed capital', async () => {
  const game = await startStudying();
  game.revealStudyCapital();
  assertEquals(el('capital').hidden, false);

  game.moveStudyIndex(1);

  assertEquals(el('capital').hidden, true);
  assertEquals(el('reveal-answer').textContent, '👁️ Reveal');
  assertEquals(el('reveal-answer').classList.contains('revealed'), false);
});

Deno.test('a country with more than one capital lists all of them', async () => {
  const game = await startStudying();
  while (text('country') !== 'Bolivia') {
    game.moveStudyIndex(1);
  }

  assertEquals(text('capital'), 'La Paz, Sucre');
});

Deno.test('switching continent restarts study at that continent\'s first country', async () => {
  const game = await startStudying();
  game.moveStudyIndex(5);

  game.switchMode('europe');

  assertEquals(text('country'), 'Albania');
  assertEquals(text('progress-value'), '1');
  assertEquals(text('total-countries'), '45');
  assertEquals(el('study-controls').hidden, false, 'switching continent should stay in study mode');
});

Deno.test('the image toggle picks which of the map and flag are shown', async () => {
  const game = await startStudying();

  assertEquals(activeImageToggle(), 'both');
  assertEquals(el('country-map').hidden, false);
  assertEquals(el('country-flag').hidden, false);

  game.setStudyImages('map');
  assertEquals(activeImageToggle(), 'map');
  assertEquals(el('country-map').hidden, false);
  assertEquals(el('country-flag').hidden, true);

  game.setStudyImages('flag');
  assertEquals(activeImageToggle(), 'flag');
  assertEquals(el('country-map').hidden, true);
  assertEquals(el('country-flag').hidden, false);

  game.setStudyImages('both');
  assertEquals(activeImageToggle(), 'both');
  assertEquals(el('country-map').hidden, false);
  assertEquals(el('country-flag').hidden, false);
});

Deno.test('the image choice sticks as you move through the countries', async () => {
  const game = await startStudying();
  game.setStudyImages('flag');

  game.moveStudyIndex(1);

  assertEquals(el('country-map').hidden, true);
  assertEquals(el('country-flag').hidden, false);
});

Deno.test('an unknown image choice is ignored', async () => {
  const game = await startStudying();
  game.setStudyImages('flag');

  game.setStudyImages('hologram');

  assertEquals(activeImageToggle(), 'flag');
  assertEquals(game.getVisibleImages(), 'flag');
});

Deno.test('play mode always shows both images, whatever study is set to', async () => {
  const game = await startStudying();
  game.setStudyImages('flag');

  game.setStudyMode(false);

  assertEquals(game.getVisibleImages(), 'both');
  assertEquals(el('country-map').hidden, false);
  assertEquals(el('country-flag').hidden, false);
});

Deno.test('study mode and the image choice survive a reload', async () => {
  setupDom();
  const game = await importGame();
  game.setStudyMode(true);
  game.setStudyImages('map');
  game.moveStudyIndex(1);

  setupDom({ resetStorage: false });
  const reloaded = await importGame();

  assertEquals(reloaded.isStudying(), true);
  assertEquals(el('study-mode').classList.contains('active'), true);
  assertEquals(el('play-mode').classList.contains('active'), false);
  assertEquals(activeImageToggle(), 'map');
  assertEquals(el('country-flag').hidden, true);
  assertEquals(text('country'), 'Albania', 'study resumes on the country you left off at');
});

Deno.test('a reload after leaving study mode comes back in play mode', async () => {
  setupDom();
  const game = await importGame();
  game.setStudyMode(true);
  game.setStudyMode(false);

  setupDom({ resetStorage: false });
  const reloaded = await importGame();

  assertEquals(reloaded.isStudying(), false);
  assertEquals(el('play-mode').classList.contains('active'), true);
  assertEquals(el('buttons-div').hidden, false);
});

Deno.test('the study controls do nothing while playing', async () => {
  setupDom();
  const game = await importGame();
  const country = text('country');

  game.moveStudyIndex(1);
  game.revealStudyCapital();

  assertEquals(text('country'), country, 'the arrows should not move the played country on');
  assertEquals(el('capital').hidden, true);
});
