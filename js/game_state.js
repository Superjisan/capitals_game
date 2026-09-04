import capitals from '../data/capitals.json' with { type: 'json' };
import africaCapitals from '../data/africa_capitals.json' with { type: 'json' };
import asiaCapitals from '../data/asia_capitals.json' with { type: 'json' };
import europeCapitals from '../data/europe_capitals.json' with { type: 'json' };
import northAmericaCapitals from '../data/north_america_capitals.json' with { type: 'json' };
import southAmericaCapitals from '../data/south_america_capitals.json' with { type: 'json' };
import oceaniaCapitals from '../data/oceania_capitals.json' with { type: 'json' };
import { saveGameState, loadGameState } from './persistence.js';

export const MODE_DATASETS = {
  world: capitals,
  africa: africaCapitals,
  asia: asiaCapitals,
  europe: europeCapitals,
  'north-america': northAmericaCapitals,
  'south-america': southAmericaCapitals,
  oceania: oceaniaCapitals,
};

let score = 0;
let countriesPlayed = [];
let countriesLeft = structuredClone(capitals);
let numCountries = Object.keys(capitals).length;
let resultsGrid = [];
let answersGiven = [];
let currentMode = 'world';
let currentCountry = null;
let feedback = '';

export function isValidMode(mode) {
  return Boolean(MODE_DATASETS[mode]);
}

export function getCorrectAnswer(country, answer) {
  const correctCapital = capitals[country];
  if (Array.isArray(correctCapital)) {
    return correctCapital.map((v) => v.toLowerCase()).includes(answer.toLowerCase());
  }
  return correctCapital.toLowerCase() === answer.toLowerCase();
}

export function getCapital(country) {
  return capitals[country];
}

export function getRandomCountry() {
  const countries = Object.keys(countriesLeft);
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
}

export function setCurrentCountry(country) {
  currentCountry = country;
}

export function setFeedback(text) {
  feedback = text;
}

export function hasPlayed(country) {
  return countriesPlayed.includes(country);
}

export function isGameOver() {
  return countriesPlayed.length >= numCountries;
}

export function recordAnswer(country, answer, correct) {
  if (correct) {
    score++;
  }
  resultsGrid.push(correct);
  answersGiven.push(answer);
  countriesPlayed.push(country);
  delete countriesLeft[country];
}

export function resetState(mode) {
  const capitalsToUse = MODE_DATASETS[mode];
  score = 0;
  countriesPlayed = [];
  countriesLeft = structuredClone(capitalsToUse);
  numCountries = Object.keys(capitalsToUse).length;
  resultsGrid = [];
  answersGiven = [];
  currentMode = mode;
  currentCountry = null;
  feedback = '';
}

export function applySavedState(state) {
  currentMode = state.mode;
  countriesPlayed = state.countriesPlayed;
  resultsGrid = state.resultsGrid;
  answersGiven = state.answersGiven;
  currentCountry = state.currentCountry;
  feedback = state.feedback || '';
  score = resultsGrid.filter(Boolean).length;
  const capitalsToUse = MODE_DATASETS[currentMode];
  numCountries = Object.keys(capitalsToUse).length;
  countriesLeft = structuredClone(capitalsToUse);
  countriesPlayed.forEach((country) => delete countriesLeft[country]);
}

export function serializeState() {
  return { mode: currentMode, currentCountry, feedback, countriesPlayed, resultsGrid, answersGiven };
}

export function getState() {
  return { score, numCountries, currentMode, currentCountry, feedback, countriesPlayed, answersGiven, resultsGrid };
}

export function saveState() {
  saveGameState(serializeState());
}

export function loadState() {
  return loadGameState(isValidMode);
}
