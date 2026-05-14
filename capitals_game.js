import capitals from './capitals.json' with { type: 'json' };

let score = 0;
let countriesPlayed = [];
let numCountries = Object.keys(capitals).length;

export function checkAnswer() {
  const answer = document.getElementById('answer').value.trim();
  const country = document.getElementById('country').innerText;
  const correctCapital = capitals[country];
  if (Array.isArray(correctCapital)) {
    return correctCapital.includes(answer);
  }
  console.log(`Correct capital: ${correctCapital}, User answer: ${answer}`);
  const correctAnswer = correctCapital.toLowerCase() === answer.toLowerCase();
  if (correctAnswer) {
    incrementScore();
  }
  countriesPlayed.push(country);
  document.getElementById('progress-value').innerText = countriesPlayed.length;
  const correctAnswerText = `The capital of ${country} is ${correctCapital}.`;
  document.getElementById('feedback').innerText = correctAnswer ? `Correct! ${correctAnswerText}` : `Wrong! ${correctAnswerText}`;
  document.getElementById('score').innerText = `Score: ${getScore()}`;
  return playGame();
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
