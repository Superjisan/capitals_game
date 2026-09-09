import { assertEquals } from 'jsr:@std/assert@1';
import { setupDom, importGame } from './support/env.js';

// Captures every window.gtag('event', name, params) call made during a test.
function stubGtag() {
  const calls = [];
  window.gtag = (...args) => calls.push(args);
  return calls;
}

Deno.test('choosing a continent tracks select_continent with the continent id', async () => {
  setupDom();
  await importGame();
  const calls = stubGtag();

  document.getElementById('oceania').click();

  assertEquals(calls, [['event', 'select_continent', { continent: 'oceania' }]]);
});

Deno.test('switching to study, then back to play, tracks select_mode for each', async () => {
  setupDom();
  await importGame();
  const calls = stubGtag();

  document.getElementById('study-mode').click();
  document.getElementById('play-mode').click();

  assertEquals(calls, [
    ['event', 'select_mode', { mode: 'study' }],
    ['event', 'select_mode', { mode: 'play' }],
  ]);
});

Deno.test('skipping tracks skip_capital with the current country and continent', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');
  const calls = stubGtag();

  const country = document.getElementById('country').innerText;
  document.getElementById('skip').click();

  assertEquals(calls, [['event', 'skip_capital', { country, mode: 'oceania' }]]);
});

Deno.test('the study image toggle tracks select_study_images with the choice', async () => {
  setupDom();
  await importGame();
  document.getElementById('study-mode').click();
  const calls = stubGtag();

  document.getElementById('map-only').click();
  document.getElementById('flag-only').click();
  document.getElementById('both-images').click();

  assertEquals(calls, [
    ['event', 'select_study_images', { images: 'map' }],
    ['event', 'select_study_images', { images: 'flag' }],
    ['event', 'select_study_images', { images: 'both' }],
  ]);
});

Deno.test('answering correctly is not tracked -- only the deliberate clicks are', async () => {
  setupDom();
  const game = await importGame();
  const calls = stubGtag();

  const country = document.getElementById('country').innerText;
  const input = document.getElementById('answer');
  input.value = game.getCapital(country);
  input.dispatchEvent(new Event('input', { bubbles: true }));

  assertEquals(String(document.getElementById('progress-value').innerText), '1');
  assertEquals(calls, []);
});

Deno.test('clicks still work when gtag is not defined (analytics blocked or not loaded)', async () => {
  setupDom();
  const game = await importGame();
  game.switchMode('oceania');
  // window.gtag is intentionally left undefined -- jsdom never runs the
  // inline <script> in index.html that defines it in production, and a real
  // visitor may have it blocked. Tracking calls must be a silent no-op, not a
  // thrown error that breaks the underlying action.
  assertEquals(typeof window.gtag, 'undefined');

  document.getElementById('skip').click();
  assertEquals(document.getElementById('score').innerText, 'Score: 0');
  assertEquals(String(document.getElementById('progress-value').innerText), '1');

  document.getElementById('study-mode').click();
  assertEquals(document.getElementById('study-mode').classList.contains('active'), true);

  document.getElementById('flag-only').click();
  assertEquals(document.getElementById('country-map').hidden, true);

  document.getElementById('africa').click();
  assertEquals(document.getElementById('africa').classList.contains('active'), true);
});
