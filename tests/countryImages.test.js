import { assertEquals } from 'jsr:@std/assert@1';
import { setupDom, importGame } from './support/env.js';

Deno.test('updateCountryMap and updateCountryFlag point at the ISO-coded URLs for a normal country', async () => {
  setupDom();
  const game = await importGame();
  game.updateCountryMap('France');
  game.updateCountryFlag('France');

  assertEquals(document.getElementById('country-map').src, 'https://raw.githubusercontent.com/djaiss/mapsicon/master/all/fr/vector.svg');
  assertEquals(document.getElementById('country-map').hidden, false);
  assertEquals(document.getElementById('country-flag').src, 'https://flagcdn.com/fr.svg');
  assertEquals(document.getElementById('country-flag').hidden, false);
});

Deno.test('updateCountryFlag falls back to worldflags.net when there is no flagcdn ISO code', async () => {
  setupDom();
  const game = await importGame();
  game.updateCountryFlag('Palestine');

  assertEquals(document.getElementById('country-flag').src, 'https://worldflags.net/assets/img/flags/palestine-flag.png');
  assertEquals(document.getElementById('country-flag').hidden, false);
});

Deno.test('updateCountryMap hides the map for a country with no known outline', async () => {
  setupDom();
  const game = await importGame();
  document.getElementById('country-map').hidden = false;
  game.updateCountryMap('Kosovo');

  assertEquals(document.getElementById('country-map').hidden, true);
});

Deno.test('updateCountryFlag hides the flag when there is no ISO code or fallback slug', async () => {
  setupDom();
  const game = await importGame();
  document.getElementById('country-flag').hidden = false;
  game.updateCountryFlag('Atlantis');

  assertEquals(document.getElementById('country-flag').hidden, true);
});

Deno.test('a broken image load hides the map/flag img elements', async () => {
  setupDom();
  await importGame();
  const mapElem = document.getElementById('country-map');
  mapElem.hidden = false;
  mapElem.dispatchEvent(new Event('error'));
  assertEquals(mapElem.hidden, true);

  const flagElem = document.getElementById('country-flag');
  flagElem.hidden = false;
  flagElem.dispatchEvent(new Event('error'));
  assertEquals(flagElem.hidden, true);
});
