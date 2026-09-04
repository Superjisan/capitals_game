import capitals from './data/capitals.json' with { type: 'json' };
import africaCapitals from './data/africa_capitals.json' with { type: 'json' };
import asiaCapitals from './data/asia_capitals.json' with { type: 'json' };
import europeCapitals from './data/europe_capitals.json' with { type: 'json' };
import northAmericaCapitals from './data/north_america_capitals.json' with { type: 'json' };
import southAmericaCapitals from './data/south_america_capitals.json' with { type: 'json' };
import oceaniaCapitals from './data/oceania_capitals.json' with { type: 'json' };
import { COUNTRY_ISO_CODES, FALLBACK_FLAG_SLUGS } from './country_iso_codes.js';

export function updateCountryMap(country) {
  const mapElem = document.getElementById('country-map');
  const isoCode = COUNTRY_ISO_CODES[country];
  if (!isoCode) {
    mapElem.hidden = true;
    return;
  }
  mapElem.src = `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${isoCode}/vector.svg`;
  mapElem.hidden = false;
}

export function updateCountryFlag(country) {
  const flagElem = document.getElementById('country-flag');
  const isoCode = COUNTRY_ISO_CODES[country];
  if (isoCode) {
    flagElem.src = `https://flagcdn.com/${isoCode}.svg`;
    flagElem.hidden = false;
    return;
  }
  const fallbackSlug = FALLBACK_FLAG_SLUGS[country];
  if (!fallbackSlug) {
    flagElem.hidden = true;
    return;
  }
  flagElem.src = `https://worldflags.net/assets/img/flags/${fallbackSlug}-flag.png`;
  flagElem.hidden = false;
}

let score = 0;
let countriesPlayed = [];
let countriesLeft = structuredClone(capitals);
let numCountries = Object.keys(capitals).length;
let resultsGrid = [];

const capitalsDataList = Object.values(capitals).flat();
const datalistElem = document.getElementById('capitals-list');
capitalsDataList.forEach((capital) => {
  const optionElem = document.createElement('option');
  optionElem.value = capital;
  datalistElem.appendChild(optionElem);
});

export function getCorrectAnswer(country, answer) {
  const correctCapital = capitals[country];
  let correctAnswer = correctCapital;
  if (Array.isArray(correctCapital)) {
    correctAnswer = correctCapital.map((v) => v.toLowerCase()).includes(answer.toLowerCase());
  } else {
    correctAnswer = correctCapital.toLowerCase() === answer.toLowerCase();
  }
  return correctAnswer;
}

export function checkAnswer(skipped = false) {
  if (countriesPlayed.length >= numCountries) {
    gameOverFeedback();
    return;
  }
  let answer = document.getElementById('answer').value.trim();
  if (skipped === true) {
    answer = 'Skipped'; // Set answer to empty string if skipped, so it will be marked as wrong and not increment score
  }
  const country = document.getElementById('country').innerText;
  const correctCapital = capitals[country];
  const correctAnswer = getCorrectAnswer(country, answer);
  if (correctAnswer) {
    incrementScore();
  }
  resultsGrid.push(correctAnswer);
  countriesPlayed.push(country);
  // update countriesLeft
  delete countriesLeft[country];

  // update html with feedback and score
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  const correctCapitalText = Array.isArray(correctCapital) ? `one of these: ${correctCapital.join(', ')}` : `${correctCapital}`;
  const correctAnswerText = `The capital of ${country} is ${correctCapitalText}`;
  const yourAnswerText = `Your answer: ${answer}`;
  document.getElementById('feedback').innerText = correctAnswer ? `Correct! ${correctAnswerText}.` : `Wrong! ${correctAnswerText}. ${yourAnswerText}`;
  document.getElementById('score').innerText = `Score: ${getScore()}`;
  
  // add the country and correct answer to the table
  addCountryAnswerToHTML(country, answer);
  // reset the answer input and play the next country
  const input = document.getElementById('answer');
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return playGame();
}

export function addCountryAnswerToHTML(country, answer) {
  const tbodyElem = document.getElementById('answers-body');
  const trElem = document.createElement('tr');
  const countryTd = document.createElement('td');
  countryTd.innerText = country;
  const capitalTd = document.createElement('td');
  capitalTd.innerText = capitals[country];
  trElem.appendChild(countryTd);
  trElem.appendChild(capitalTd);
  tbodyElem.appendChild(trElem);

  console.log(`Country: ${country}, User answer: ${answer}, Correct capital(s): ${capitals[country]}`);
  const correctAnswer = getCorrectAnswer(country, answer);
  trElem.style.backgroundColor = correctAnswer ? 'lightgreen' : 'lightcoral';
  const resultTd = document.createElement('td');
  resultTd.innerText = correctAnswer ? 'Correct' : 'Wrong';
  trElem.appendChild(resultTd);

  const yourAnswerTd = document.createElement('td');
  yourAnswerTd.innerText = answer;
  trElem.appendChild(yourAnswerTd);
}

export function getCapital(country) {
  return capitals[country];
}

export function getRandomCountry() {
  const countries = Object.keys(countriesLeft);
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
}

export function gameOverFeedback() {
  const yourScoreText = `Your final score is ${getScore()} out of ${numCountries}.`;
  document.getElementById('feedback').innerText = `Game over! You have played all countries for this setting. ${yourScoreText}`;
  document.getElementById('share').hidden = false;
}

export function buildResultsEmojiGrid(rowSize = 10) {
  const squares = resultsGrid.map((correct) => correct ? '🟩' : '🟥');
  const rows = [];
  for (let i = 0; i < squares.length; i += rowSize) {
    rows.push(squares.slice(i, i + rowSize).join(''));
  }
  return rows.join('\n');
}

export function buildShareText() {
  const activeContinentButton = document.querySelector('.continent-btn.active');
  const modeName = activeContinentButton ? activeContinentButton.innerText : 'World';
  return `Capitals Game - ${modeName}\nScore: ${getScore()}/${numCountries}\n${buildResultsEmojiGrid()}`;
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
  if (countriesPlayed.includes(country) && countriesPlayed.length < numCountries) {
    return playGame(); // Skip if the country has already been played
  } else if (countriesPlayed.length >= numCountries) {
    gameOverFeedback();
    return;
  }
  // add the country to html
  document.getElementById('country').innerText = country;
  updateCountryMap(country);
  updateCountryFlag(country);
  return country;
}

export function resetGame(capitalsToUse = capitals) {
  score = 0;
  countriesPlayed = [];
  countriesLeft = structuredClone(capitalsToUse);
  numCountries = Object.keys(capitalsToUse).length;
  resultsGrid = [];

  score = 0;
  countriesPlayed = [];
  document.getElementById('score').innerText = `Score: ${getScore()}`;
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  document.getElementById('total-countries').innerText = numCountries;
  document.getElementById('share').hidden = true;

  // clear the table of previous answers
  const tbodyElem = document.getElementById('answers-body');
  while (tbodyElem.firstChild) {
    tbodyElem.removeChild(tbodyElem.firstChild);
  }

}

export function incrementScore() {
  score++;
}

export function getScore() {
  return score;
}

export function removeActiveClassFromContinentButtons() {
  const buttons = document.getElementsByClassName('continent-btn');
  for (let button of buttons) {
    button.classList.remove('active');
  }
}

document.getElementById('country-map').addEventListener('error', function () {
  this.hidden = true;
});
document.getElementById('country-flag').addEventListener('error', function () {
  this.hidden = true;
});

resetGame();
playGame();
document.getElementById('answer').addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    // Your code to run when Enter is pressed
    checkAnswer();
  }
});
document.getElementById('submit').addEventListener('click', checkAnswer);
document.getElementById('skip').addEventListener('click', () => {
  checkAnswer(true); // Pass true to indicate the question was skipped
});
document.getElementById('share').addEventListener('click', shareScore);

// button listeners for continents
document.getElementById('africa').addEventListener('click', () => {
  resetGame(africaCapitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('africa').classList.add('active');
  playGame();
});
document.getElementById('asia').addEventListener('click', () => {
  resetGame(asiaCapitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('asia').classList.add('active');
  playGame();
});
document.getElementById('europe').addEventListener('click', () => {
  resetGame(europeCapitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('europe').classList.add('active');
  playGame();
});
document.getElementById('north-america').addEventListener('click', () => {
  resetGame(northAmericaCapitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('north-america').classList.add('active');
  playGame();
});
document.getElementById('south-america').addEventListener('click', () => {
  resetGame(southAmericaCapitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('south-america').classList.add('active');
  playGame();
});
document.getElementById('world').addEventListener('click', () => {
  resetGame(capitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('world').classList.add('active');
  playGame();
});
document.getElementById('oceania').addEventListener('click', () => {
  resetGame(oceaniaCapitals);
  removeActiveClassFromContinentButtons();
  document.getElementById('oceania').classList.add('active');
  playGame();
});

// TO be able to install it as a PWA, we need to register a service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/capitals_game/sw.js')
      .then(reg => console.log('Service Worker registered!', reg))
      .catch(err => console.log('Registration failed: ', err));
  });
}

