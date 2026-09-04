import {
  MODE_DATASETS, isValidMode, getCorrectAnswer, getCapital, getRandomCountry, setCurrentCountry,
  hasPlayed, isGameOver, recordAnswer, resetState, applySavedState, serializeState, getState,
} from './game_state.js';
import { updateCountryMap, updateCountryFlag } from './country_images.js';
import { buildAnswerRow, clearAnswersTable } from './answers_table.js';
import { saveGameState, loadGameState } from './persistence.js';
import { populateCapitalsDatalist } from './datalist.js';

export { getCorrectAnswer, getCapital, getRandomCountry, getState, updateCountryMap, updateCountryFlag };

populateCapitalsDatalist(MODE_DATASETS.world);

export function addCountryAnswerToHTML(country, answer) {
  buildAnswerRow(country, getCapital(country), answer, getCorrectAnswer(country, answer));
}

export function checkAnswer(skipped = false) {
  if (isGameOver()) {
    gameOverFeedback();
    return;
  }
  let answer = document.getElementById('answer').value.trim();
  if (skipped === true) {
    answer = 'Skipped'; // Set answer to 'Skipped' so it will be marked as wrong and not increment score
  }
  const country = document.getElementById('country').innerText;
  const correctCapital = getCapital(country);
  const correctAnswer = getCorrectAnswer(country, answer);
  recordAnswer(country, answer, correctAnswer);

  document.getElementById('progress-value').innerText = getState().countriesPlayed.length;
  const correctCapitalText = Array.isArray(correctCapital) ? `one of these: ${correctCapital.join(', ')}` : `${correctCapital}`;
  const correctAnswerText = `The capital of ${country} is ${correctCapitalText}`;
  const yourAnswerText = `Your answer: ${answer}`;
  document.getElementById('feedback').innerText = correctAnswer ? `Correct! ${correctAnswerText}.` : `Wrong! ${correctAnswerText}. ${yourAnswerText}`;
  document.getElementById('score').innerText = `Score: ${getState().score}`;

  addCountryAnswerToHTML(country, answer);

  const input = document.getElementById('answer');
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return playGame();
}

export function gameOverFeedback() {
  const { score, numCountries } = getState();
  document.getElementById('feedback').innerText = `Game over! You have played all countries for this setting. Your final score is ${score} out of ${numCountries}.`;
  document.getElementById('share').hidden = false;
  saveState();
}

export function buildResultsEmojiGrid(rowSize = 10) {
  const squares = getState().resultsGrid.map((correct) => correct ? '🟩' : '🟥');
  const rows = [];
  for (let i = 0; i < squares.length; i += rowSize) {
    rows.push(squares.slice(i, i + rowSize).join(''));
  }
  return rows.join('\n');
}

export function buildShareText() {
  const activeContinentButton = document.querySelector('.continent-btn.active');
  const modeName = activeContinentButton ? activeContinentButton.textContent.trim() : 'World';
  const { score, numCountries } = getState();
  return `Capitals Game - ${modeName}\nScore: ${score}/${numCountries}\n${buildResultsEmojiGrid()}`;
}

export async function shareScore() {
  const shareData = { text: buildShareText(), url: window.location.href };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.error(err);
    }
    return;
  }
  const shareButton = document.getElementById('share');
  const originalLabel = shareButton.innerText;
  try {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    shareButton.innerText = 'Copied to clipboard!';
  } catch (err) {
    shareButton.innerText = 'Could not copy score';
  }
  setTimeout(() => {
    shareButton.innerText = originalLabel;
  }, 2000);
}

export function playGame() {
  const country = getRandomCountry();
  if (hasPlayed(country) && !isGameOver()) {
    return playGame(); // Skip if the country has already been played
  } else if (isGameOver()) {
    gameOverFeedback();
    return;
  }
  setCurrentCountry(country);
  document.getElementById('country').innerText = country;
  updateCountryMap(country);
  updateCountryFlag(country);
  saveState();
  return country;
}

export function resetGame(mode = 'world') {
  resetState(mode);
  const { score, countriesPlayed, numCountries } = getState();
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  document.getElementById('total-countries').innerText = numCountries;
  document.getElementById('share').hidden = true;
  document.getElementById('feedback').innerText = '';
  clearAnswersTable();
  saveState();
}

export function removeActiveClassFromContinentButtons() {
  const buttons = document.getElementsByClassName('continent-btn');
  for (const button of buttons) {
    button.classList.remove('active');
  }
}

export function saveState() {
  saveGameState(serializeState(document.getElementById('feedback').innerText));
}

export function loadState() {
  return loadGameState(isValidMode);
}

export function restoreState(state) {
  applySavedState(state);
  const { score, countriesPlayed, numCountries, currentMode, currentCountry, answersGiven } = getState();

  removeActiveClassFromContinentButtons();
  document.getElementById(currentMode).classList.add('active');
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  document.getElementById('total-countries').innerText = numCountries;
  document.getElementById('feedback').innerText = state.feedback || '';

  clearAnswersTable();
  countriesPlayed.forEach((country, i) => addCountryAnswerToHTML(country, answersGiven[i]));

  if (currentCountry) {
    document.getElementById('country').innerText = currentCountry;
    updateCountryMap(currentCountry);
    updateCountryFlag(currentCountry);
  }
  if (isGameOver()) {
    gameOverFeedback();
  } else if (!currentCountry) {
    playGame();
  }
}

export function switchMode(mode) {
  resetGame(mode);
  removeActiveClassFromContinentButtons();
  document.getElementById(mode).classList.add('active');
  playGame();
}

export function initGame() {
  const savedState = loadState();
  if (savedState) {
    restoreState(savedState);
  } else {
    switchMode('world');
  }
}
