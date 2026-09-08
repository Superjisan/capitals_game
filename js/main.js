import { checkAnswer, switchMode, initGame } from './capitals_game.js';
import { MODE_DATASETS } from './game_state.js';
import { registerCountryImageErrorHandlers } from './country_images.js';
import { registerServiceWorker } from './pwa.js';
import { shareScore } from './share.js';
import { bindCapitalSuggestions } from './datalist.js';

export * from './capitals_game.js';

registerCountryImageErrorHandlers();
initGame();
bindCapitalSuggestions();

const answerInput = document.getElementById('answer');

answerInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') {
    return;
  }

  const suggestions = document.getElementById('answer-suggestions');
  if (suggestions && !suggestions.hidden) {
    event.preventDefault();
    const selected = suggestions.querySelector('.capital-suggestion.active')
      || suggestions.querySelector('.capital-suggestion');
    if (selected) {
      answerInput.value = selected.textContent;
      suggestions.hidden = true;
      return;
    }
  }

  checkAnswer();
});
document.getElementById('submit').addEventListener('click', checkAnswer);
document.getElementById('skip').addEventListener('click', () => checkAnswer(true));
document.getElementById('share').addEventListener('click', shareScore);

// button listeners for continents
Object.keys(MODE_DATASETS).forEach((mode) => {
  document.getElementById(mode).addEventListener('click', () => switchMode(mode));
});

registerServiceWorker();
