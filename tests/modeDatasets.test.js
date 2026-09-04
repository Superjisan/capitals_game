import { assertEquals } from 'jsr:@std/assert@1';
import { MODE_DATASETS } from '../js/game_state.js';

Deno.test('Russia is playable in both Asia and Europe modes', () => {
  assertEquals('Russia' in MODE_DATASETS.asia, true);
  assertEquals('Russia' in MODE_DATASETS.europe, true);
});

Deno.test('Türkiye is only playable in Asia mode, not Europe', () => {
  assertEquals('Türkiye' in MODE_DATASETS.asia, true);
  assertEquals('Türkiye' in MODE_DATASETS.europe, false);
});

Deno.test('every continent mode is a non-empty subset of World', () => {
  const worldCountries = new Set(Object.keys(MODE_DATASETS.world));
  for (const [mode, dataset] of Object.entries(MODE_DATASETS)) {
    if (mode === 'world') {
      continue;
    }
    const countries = Object.keys(dataset);
    assertEquals(countries.length > 0, true, `${mode} should not be empty`);
    for (const country of countries) {
      assertEquals(worldCountries.has(country), true, `${country} in ${mode} should also be in World`);
    }
  }
});
