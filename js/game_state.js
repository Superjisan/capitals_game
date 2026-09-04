import countries from '../data/capitals.json' with { type: 'json' };
import { saveGameState, loadGameState } from './persistence.js';

const CONTINENTS = ['africa', 'asia', 'europe', 'north-america', 'south-america', 'oceania'];

// Plain { country: capital } map, e.g. { Afghanistan: "Kabul", Bolivia: ["La Paz", "Sucre"] }.
// A capital is an array only when a country genuinely has more than one (Bolivia,
// South Africa); alternate spellings of a single capital live in each country's
// own "aliases" list instead (see getCorrectAnswer) and never appear here, so this
// map always reflects the one canonical name to display.
// Countries can belong to zero continents (e.g. England, only playable in World mode)
// or more than one (e.g. Russia, playable in both Asia and Europe).
const capitals = Object.fromEntries(
  Object.entries(countries).map(([country, data]) => [country, data.capital])
);

export const MODE_DATASETS = {
  world: capitals,
  ...Object.fromEntries(
    CONTINENTS.map((continent) => [
      continent,
      Object.fromEntries(
        Object.entries(countries)
          .filter(([, data]) => data.continents.includes(continent))
          .map(([country, data]) => [country, data.capital])
      ),
    ])
  ),
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
  const lowerAnswer = answer.toLowerCase();
  if (Array.isArray(correctCapital)) {
    return correctCapital.some((v) => v.toLowerCase() === lowerAnswer);
  }
  if (correctCapital.toLowerCase() === lowerAnswer) {
    return true;
  }
  const aliases = countries[country].aliases;
  return Boolean(aliases && aliases.some((v) => v.toLowerCase() === lowerAnswer));
}

export function getCapital(country) {
  return capitals[country];
}

export function getCountryIso(country) {
  return countries[country]?.iso ?? null;
}

export function getFallbackFlagSlug(country) {
  return countries[country]?.flagSlug ?? null;
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
