import {
  MODE_DATASETS, getCorrectAnswer, getCapital, getRandomCountry, setCurrentCountry, setFeedback,
  hasPlayed, isGameOver, recordAnswer, resetState, applySavedState, getState, saveState, loadState,
} from './game_state.js';
import { updateCountryMap, updateCountryFlag, mapUrl, setVisibleImages, getVisibleImages } from './country_images.js';
import { buildAnswerRow, clearAnswersTable } from './answers_table.js';
import { populateCapitalsDatalist } from './datalist.js';
import { saveGameMode, loadGameMode, saveStudyImages, loadStudyImages, STUDY_IMAGE_CHOICES } from './persistence.js';

export { getCorrectAnswer, getCapital, getRandomCountry, getState, updateCountryMap, updateCountryFlag, mapUrl, getVisibleImages };
export { buildResultsEmojiGrid, buildShareText, shareScore } from './share.js';

let isStudyMode = false;
let studyIndex = 0;

populateCapitalsDatalist(MODE_DATASETS.world);

function studyCountries(mode = getState().currentMode || 'world') {
  return Object.keys(MODE_DATASETS[mode] ?? MODE_DATASETS.world);
}

function formatCapital(capital) {
  return Array.isArray(capital) ? capital.join(', ') : capital;
}

export function isStudying() {
  return isStudyMode;
}

export function getStudyIndex() {
  return studyIndex;
}

export function setStudyMode(enabled) {
  isStudyMode = enabled;
  saveGameMode(enabled ? 'study' : 'play');
  document.getElementById('play-mode')?.classList.toggle('active', !enabled);
  document.getElementById('study-mode')?.classList.toggle('active', enabled);
  setVisibleImages(enabled ? loadStudyImages() : 'both');
  syncImageToggleButtons();
  resetGame(getState().currentMode || 'world');
  if (enabled) {
    studyIndex = 0;
    showStudyCountry();
  } else {
    playGame();
  }
  syncActionButtons();
}

export function setStudyImages(preference) {
  if (!STUDY_IMAGE_CHOICES.includes(preference)) {
    return;
  }
  saveStudyImages(preference);
  setVisibleImages(preference);
  syncImageToggleButtons();
  const country = document.getElementById('country').innerText;
  if (country) {
    updateCountryMap(country);
    updateCountryFlag(country);
  }
}

export function syncImageToggleButtons() {
  const preference = getVisibleImages();
  document.querySelectorAll('.image-toggle-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.images === preference);
  });
}

export function revealStudyCapital() {
  if (!isStudyMode) {
    return;
  }
  const capitalElem = document.getElementById('capital');
  const revealButton = document.getElementById('reveal-answer');
  const shouldReveal = capitalElem.hidden;
  capitalElem.hidden = !shouldReveal;
  revealButton.classList.toggle('revealed', shouldReveal);
  revealButton.textContent = shouldReveal ? '🙈 Hide' : '👁️ Reveal';
}

export function moveStudyIndex(delta) {
  if (!isStudyMode) {
    return;
  }
  const total = studyCountries().length;
  if (!total) {
    return;
  }
  studyIndex = (studyIndex + delta + total) % total;
  showStudyCountry();
}

export function showStudyCountry() {
  const countries = studyCountries();
  if (!countries.length) {
    return;
  }
  studyIndex = Math.max(0, Math.min(studyIndex, countries.length - 1));
  const country = countries[studyIndex];
  setCurrentCountry(country);
  document.getElementById('country').innerText = country;

  const capitalElem = document.getElementById('capital');
  capitalElem.innerText = formatCapital(getCapital(country));
  capitalElem.hidden = true;

  const revealButton = document.getElementById('reveal-answer');
  revealButton.textContent = '👁️ Reveal';
  revealButton.classList.remove('revealed');

  document.getElementById('progress-value').innerText = String(studyIndex + 1);
  document.getElementById('total-countries').innerText = String(countries.length);
  updateCountryMap(country);
  updateCountryFlag(country);
  saveState();
}

export function syncActionButtons() {
  const gameOver = isGameOver();

  document.getElementById('input-div').dataset.mode = isStudyMode ? 'study' : 'play';
  document.getElementById('answer-wrapper').hidden = isStudyMode;
  document.getElementById('answer').disabled = isStudyMode;
  document.getElementById('reveal-answer').hidden = !isStudyMode;
  document.getElementById('buttons-div').hidden = isStudyMode;
  document.getElementById('study-controls').hidden = !isStudyMode;
  document.getElementById('image-toggle').hidden = !isStudyMode;
  document.getElementById('score').hidden = isStudyMode;
  document.getElementById('answers-table').hidden = isStudyMode;
  document.getElementById('share').hidden = isStudyMode || !gameOver;
  if (!isStudyMode) {
    document.getElementById('capital').hidden = true;
  }
}

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
  const feedbackText = correctAnswer ? `Correct! ${correctAnswerText}.` : `Wrong! ${correctAnswerText}. ${yourAnswerText}`;
  setFeedback(feedbackText);
  document.getElementById('feedback').innerText = feedbackText;
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
  const feedbackText = `Game over! You have played all countries for this setting. Your final score is ${score} out of ${numCountries}.`;
  setFeedback(feedbackText);
  document.getElementById('feedback').innerText = feedbackText;
  document.getElementById('share').hidden = false;
  syncActionButtons();
  saveState();
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
  syncActionButtons();
  saveState();
}

export function removeActiveClassFromContinentButtons() {
  const buttons = document.getElementsByClassName('continent-btn');
  for (const button of buttons) {
    button.classList.remove('active');
  }
}

export function restoreState(state) {
  applySavedState(state);
  const { score, countriesPlayed, numCountries, currentMode, currentCountry, answersGiven, feedback } = getState();

  removeActiveClassFromContinentButtons();
  document.getElementById(currentMode).classList.add('active');
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  document.getElementById('total-countries').innerText = numCountries;
  document.getElementById('feedback').innerText = feedback;

  clearAnswersTable();
  countriesPlayed.forEach((country, i) => addCountryAnswerToHTML(country, answersGiven[i]));

  if (isStudyMode) {
    const savedIndex = studyCountries(currentMode).indexOf(currentCountry);
    studyIndex = savedIndex === -1 ? 0 : savedIndex;
    showStudyCountry();
    syncActionButtons();
    return;
  }

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
  syncActionButtons();
}

export function switchMode(mode) {
  resetGame(mode);
  removeActiveClassFromContinentButtons();
  document.getElementById(mode).classList.add('active');
  if (isStudyMode) {
    studyIndex = 0;
    showStudyCountry();
  } else {
    playGame();
  }
  syncActionButtons();
}

export function initGame() {
  const savedState = loadState();
  isStudyMode = loadGameMode() === 'study';
  setVisibleImages(isStudyMode ? loadStudyImages() : 'both');
  syncImageToggleButtons();
  document.getElementById('play-mode')?.classList.toggle('active', !isStudyMode);
  document.getElementById('study-mode')?.classList.toggle('active', isStudyMode);
  if (savedState) {
    restoreState(savedState);
  } else {
    switchMode('world');
  }
  syncActionButtons();
}
