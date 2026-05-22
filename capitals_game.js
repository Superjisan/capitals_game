import capitals from './capitals.json' with { type: 'json' };
import africaCapitals from './africa_capitals.json' with { type: 'json' };
import asiaCapitals from './asia_capitals.json' with { type: 'json' };
import europeCapitals from './europe_capitals.json' with { type: 'json' };
import northAmericaCapitals from './north_america_capitals.json' with { type: 'json' };
import southAmericaCapitals from './south_america_capitals.json' with { type: 'json' };
import oceaniaCapitals from './oceania_capitals.json' with { type: 'json' };

let score = 0;
let countriesPlayed = [];
let countriesLeft = structuredClone(capitals);
let numCountries = Object.keys(capitals).length;

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

export function checkAnswer() {
  if (countriesPlayed.length >= numCountries) {
    gameOverFeedback();
    return;
  }
  const answer = document.getElementById('answer').value.trim();
  const country = document.getElementById('country').innerText;
  const correctCapital = capitals[country];
  const correctAnswer = getCorrectAnswer(country, answer);
  if (correctAnswer) {
    incrementScore();
  }
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
  return country;
}

export function resetGame(capitalsToUse = capitals) {
  score = 0;
  countriesPlayed = [];
  countriesLeft = structuredClone(capitalsToUse);
  numCountries = Object.keys(capitalsToUse).length;

  score = 0;
  countriesPlayed = [];
  document.getElementById('score').innerText = `Score: ${getScore()}`;
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  document.getElementById('total-countries').innerText = numCountries;

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

resetGame();
playGame();
document.getElementById('answer').addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    // Your code to run when Enter is pressed
    checkAnswer();
  }
});
document.getElementById('submit').addEventListener('click', checkAnswer);

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

