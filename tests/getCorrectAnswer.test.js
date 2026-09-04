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
