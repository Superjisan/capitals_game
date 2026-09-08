import { assert, assertEquals, assertMatch } from 'jsr:@std/assert@1';
import countries from '../data/capitals.json' with { type: 'json' };
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
  game.updateCountryMap('Tuvalu');

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

Deno.test('Kosovo gets a map from the override even though mapsicon master has none', async () => {
  setupDom();
  const game = await importGame();
  game.updateCountryMap('Kosovo');

  const mapElem = document.getElementById('country-map');
  assertEquals(mapElem.hidden, false);
  assertMatch(mapElem.src, /\/europe\/xk\/vector\.svg$/);
});

Deno.test('Serbia uses the override rather than the mapsicon map that swallows Kosovo', async () => {
  setupDom();
  const game = await importGame();
  game.updateCountryMap('Serbia');

  const mapElem = document.getElementById('country-map');
  assertEquals(mapElem.hidden, false);
  assertMatch(mapElem.src, /\/europe\/rs\/vector\.svg$/);
  assertEquals(mapElem.src.includes('djaiss/mapsicon/master'), false);
});

Deno.test('every map override is pinned to a commit rather than a moving branch', () => {
  const overrides = Object.entries(countries)
    .filter(([, data]) => data.mapUrl)
    .map(([country, data]) => [country, data.mapUrl]);

  assert(overrides.length > 0, 'the Kosovo and Serbia overrides should still be here');
  for (const [country, url] of overrides) {
    assertMatch(url, /^https:\/\/raw\.githubusercontent\.com\//, `${country} should load over https from raw.githubusercontent`);
    assertMatch(url, /\/[0-9a-f]{40}\//, `${country} should pin a 40-character commit sha, not a branch name`);
  }
});
