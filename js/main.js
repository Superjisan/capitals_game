import {
  checkAnswer, switchMode, initGame, setStudyMode, setStudyImages, revealStudyCapital, moveStudyIndex,
} from './capitals_game.js';
import { MODE_DATASETS, getCorrectAnswer } from './game_state.js';
import { registerCountryImageErrorHandlers } from './country_images.js';
import { registerServiceWorker } from './pwa.js';
import { shareScore } from './share.js';
import { bindCapitalSuggestions } from './datalist.js';

export * from './capitals_game.js';

function trackEvent(name, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

function activeContinent() {
  return document.querySelector('.continent-btn.active')?.id || 'world';
}

registerCountryImageErrorHandlers();
initGame();
bindCapitalSuggestions();

const answerInput = document.getElementById('answer');

answerInput.addEventListener('input', () => {
  const country = document.getElementById('country').innerText;
  const value = answerInput.value.trim();

  if (!country || !value) {
    return;
  }

  if (getCorrectAnswer(country, value)) {
    checkAnswer();
  }
});

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
document.getElementById('skip').addEventListener('click', () => {
  trackEvent('skip_capital', {
    country: document.getElementById('country').innerText,
    mode: activeContinent(),
  });
  checkAnswer(true);
});
document.getElementById('share').addEventListener('click', shareScore);
document.getElementById('play-mode').addEventListener('click', () => {
  trackEvent('select_mode', { mode: 'play' });
  setStudyMode(false);
});
document.getElementById('study-mode').addEventListener('click', () => {
  trackEvent('select_mode', { mode: 'study' });
  setStudyMode(true);
});
document.getElementById('study-prev').addEventListener('click', () => moveStudyIndex(-1));
document.getElementById('study-next').addEventListener('click', () => moveStudyIndex(1));
document.getElementById('reveal-answer').addEventListener('click', () => revealStudyCapital());
document.querySelectorAll('.image-toggle-btn').forEach((button) => {
  button.addEventListener('click', () => {
    trackEvent('select_study_images', { images: button.dataset.images });
    setStudyImages(button.dataset.images);
  });
});

// button listeners for continents
Object.keys(MODE_DATASETS).forEach((mode) => {
  document.getElementById(mode).addEventListener('click', () => {
    trackEvent('select_continent', { continent: mode });
    switchMode(mode);
  });
});

registerServiceWorker();
