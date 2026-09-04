import { checkAnswer, shareScore, switchMode, initGame } from './capitals_game.js';
import { MODE_DATASETS } from './game_state.js';
import { registerCountryImageErrorHandlers } from './country_images.js';
import { registerServiceWorker } from './pwa.js';

export * from './capitals_game.js';

registerCountryImageErrorHandlers();
initGame();

document.getElementById('answer').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    checkAnswer();
  }
});
document.getElementById('submit').addEventListener('click', checkAnswer);
document.getElementById('skip').addEventListener('click', () => checkAnswer(true));
document.getElementById('share').addEventListener('click', shareScore);

// button listeners for continents
Object.keys(MODE_DATASETS).forEach((mode) => {
  document.getElementById(mode).addEventListener('click', () => switchMode(mode));
});

registerServiceWorker();
