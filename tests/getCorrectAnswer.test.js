import { assertEquals } from 'jsr:@std/assert@1';
import { setupDom, importGame } from './support/env.js';

Deno.test('getCorrectAnswer matches a single capital case-insensitively', async () => {
  setupDom();
  const game = await importGame();
  assertEquals(game.getCorrectAnswer('France', 'paris'), true);
  assertEquals(game.getCorrectAnswer('France', 'PARIS'), true);
});

Deno.test('getCorrectAnswer rejects a wrong answer', async () => {
  setupDom();
  const game = await importGame();
  assertEquals(game.getCorrectAnswer('France', 'Lyon'), false);
});

Deno.test('getCorrectAnswer accepts any alias for capitals with multiple accepted spellings', async () => {
  setupDom();
  const game = await importGame();
  assertEquals(game.getCorrectAnswer('Albania', 'Tirane'), true);
  assertEquals(game.getCorrectAnswer('Albania', 'tirana'), true);
  assertEquals(game.getCorrectAnswer('Albania', 'Skopje'), false);
});

Deno.test('getCorrectAnswer accepts every punctuation variant of a spelled-out alias, case-insensitively', async () => {
  setupDom();
  const game = await importGame();
  const variants = ["Saint John's", "St. John's", 'Saint Johns', 'St. Johns', 'St Johns'];
  for (const variant of variants) {
    assertEquals(game.getCorrectAnswer('Antigua and Barbuda', variant), true, `expected "${variant}" to be accepted`);
    assertEquals(game.getCorrectAnswer('Antigua and Barbuda', variant.toLowerCase()), true, `expected "${variant.toLowerCase()}" to be accepted`);
  }
  assertEquals(game.getCorrectAnswer('Antigua and Barbuda', "St George's"), false);
});

Deno.test('getCorrectAnswer accepts any of a country\'s genuinely distinct capitals', async () => {
  setupDom();
  const game = await importGame();
  assertEquals(game.getCorrectAnswer('Bolivia', 'La Paz'), true);
  assertEquals(game.getCorrectAnswer('Bolivia', 'sucre'), true);
  assertEquals(game.getCorrectAnswer('Bolivia', 'Cochabamba'), false);

  // Colombo is the commercial capital and former capital, still widely
  // considered "the capital" alongside the official Sri Jayawardenapura Kotte --
  // a genuinely second capital, not a spelling variant of one.
  assertEquals(game.getCorrectAnswer('Sri Lanka', 'Sri Jayawardenapura Kotte'), true);
  assertEquals(game.getCorrectAnswer('Sri Lanka', 'colombo'), true);
  assertEquals(game.getCorrectAnswer('Sri Lanka', 'Kandy'), false);
});

Deno.test('getCapital displays a single canonical name even when other spellings are accepted', async () => {
  setupDom();
  const game = await importGame();
  assertEquals(game.getCapital('Antigua and Barbuda'), "St. John's");
  assertEquals(game.getCapital('Ukraine'), 'Kyiv');
  assertEquals(game.getCapital('United States'), 'Washington D.C.');
});
