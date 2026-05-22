import capitals from './capitals.json' with { type: 'json' };

let score = 0;
let countriesPlayed = [];
let numCountries = Object.keys(capitals).length;

export function getCorrectAnswer(country, answer) {
  const correctCapital = capitals[country];
  let correctAnswer = correctCapital;
  if (Array.isArray(correctCapital)) {
    correctAnswer = correctCapital.map((v) => v.toLowerCase()).includes(answer.toLowerCase());
  } else {
    console.log(`Correct capital: ${correctCapital}, User answer: ${answer}`);
    correctAnswer = correctCapital.toLowerCase() === answer.toLowerCase();
  }
  return correctAnswer;
}

export function checkAnswer() {
  const answer = document.getElementById('answer').value.trim();
  const country = document.getElementById('country').innerText;
  const correctCapital = capitals[country];
  const correctAnswer = getCorrectAnswer(country, answer);
  // let correctAnswer = correctCapital;
  // if (Array.isArray(correctCapital)) {
  //   correctAnswer = correctCapital.map((v) => v.toLowerCase()).includes(answer.toLowerCase());
  // } else {
  //   console.log(`Correct capital: ${correctCapital}, User answer: ${answer}`);
  //   correctAnswer = correctCapital.toLowerCase() === answer.toLowerCase();
  // }
  if (correctAnswer) {
    incrementScore();
  }
  countriesPlayed.push(country);
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  const correctCapitalText = Array.isArray(correctCapital) ? `one of these: ${correctCapital.join(', ')}` : `${correctCapital}`;
  const correctAnswerText = `The capital of ${country} is ${correctCapitalText}`;
  const yourAnswerText = `Your answer: ${answer}`;
  document.getElementById('feedback').innerText = correctAnswer ? `Correct! ${correctAnswerText}.` : `Wrong! ${correctAnswerText}. ${yourAnswerText}`;
  document.getElementById('score').innerText = `Score: ${getScore()}`;
  
  // add the country and correct answer to the table
  addCountryAnswerToHTML(country, answer);
  // reset the answer input and play the next country
  document.getElementById('answer').value = '';
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
  const countries = Object.keys(capitals);
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
}

export function playGame() {
  const country = getRandomCountry();
  if (countriesPlayed.includes(country)) {
    return playGame(); // Skip if the country has already been played
  }
  // add the country to html
  document.getElementById('country').innerText = country;
  return country;
}

export function resetGame() {
  score = 0;
  countriesPlayed = [];
  document.getElementById('score').innerText = `Score: ${getScore()}`;
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  document.getElementById('total-countries').innerText = numCountries;

}

export function incrementScore() {
  score++;
}

export function getScore() {
  return score;
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
