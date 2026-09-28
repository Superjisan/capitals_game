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

Deno.test('the constituent countries of the United Kingdom fly their own flag over the union flag', async () => {
  setupDom();
  const game = await importGame();
  const flagElem = document.getElementById('country-flag');

  for (const [country, slug] of [
    ['England', 'england'],
    ['Wales', 'wales'],
    ['Scotland', 'scotland'],
    ['Northern Ireland', 'northern-ireland'],
  ]) {
    flagElem.hidden = true;
    game.updateCountryFlag(country);
    assertEquals(flagElem.src, `https://worldflags.net/assets/img/flags/${slug}-flag.png`);
    assertEquals(flagElem.hidden, false, `${country} should show a flag`);

    game.updateCountryMap(country);
    assertEquals(document.getElementById('country-map').src, 'https://raw.githubusercontent.com/djaiss/mapsicon/master/all/gb/vector.svg');
  }
});

Deno.test('updateCountryMap hides the map for a country it knows nothing about', async () => {
  setupDom();
  const game = await importGame();
  document.getElementById('country-map').hidden = false;
  game.updateCountryMap('Atlantis');

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

const mapOverrides = Object.entries(countries)
  .filter(([, data]) => data.mapUrl)
  .map(([country, data]) => [country, data.mapUrl]);

Deno.test('every remote map override is pinned to a commit rather than a moving branch', () => {
  const remote = mapOverrides.filter(([, url]) => url.startsWith('http'));

  assert(remote.length > 0, 'the Kosovo and Serbia overrides should still be here');
  for (const [country, url] of remote) {
    assertMatch(url, /^https:\/\/raw\.githubusercontent\.com\//, `${country} should load over https from raw.githubusercontent`);
    assertMatch(url, /\/[0-9a-f]{40}\//, `${country} should pin a 40-character commit sha, not a branch name`);
  }
});

Deno.test('every map drawn in this repo is on disk and is a single-path svg', async () => {
  const local = mapOverrides.filter(([, url]) => !url.startsWith('http'));

  assert(local.length > 0, 'the Palestine and Micronesia icons should still be here');
  for (const [country, path] of local) {
    const svg = await Deno.readTextFile(new URL(`../${path}`, import.meta.url));
    assertMatch(svg, /<svg[^>]*viewBox="0 0 1024 1024"/, `${country} should use the 1024 square mapsicon uses`);
    assertEquals(svg.match(/<path/g)?.length, 1, `${country} should be one filled silhouette, like every other map`);
    assertEquals(/fill=/.test(svg), false, `${country} should inherit the default black fill rather than set its own`);
  }
});

Deno.test('the countries mapsicon has no map for draw the ones this repo ships', async () => {
  setupDom();
  const game = await importGame();
  const mapElem = document.getElementById('country-map');

  for (const [country, file] of [
    ['Palestine', 'ps'],
    ['Federated States of Micronesia', 'fm'],
    ['Tuvalu', 'tv'],
    ['Marshall Islands', 'mh'],
  ]) {
    mapElem.hidden = true;
    game.updateCountryMap(country);
    assertEquals(mapElem.hidden, false, `${country} should show a map`);
    assertMatch(mapElem.src, new RegExp(`maps/${file}\\.svg$`));
  }
});

Deno.test('every country in the dataset can draw a map', () => {
  const mapless = Object.entries(countries)
    .filter(([, data]) => !data.iso && !data.mapUrl)
    .map(([country]) => country);

  assertEquals(mapless, [], 'these countries would render with no outline at all');
});
