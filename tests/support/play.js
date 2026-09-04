// Answers whatever country is currently displayed, looking up the correct
// capital from the given dataset so tests don't depend on random play order.
export function answerCurrentCountry(game, capitals, { skip = false } = {}) {
  const country = document.getElementById('country').innerText;
  if (!skip) {
    const capital = capitals[country];
    document.getElementById('answer').value = Array.isArray(capital) ? capital[0] : capital;
  }
  game.checkAnswer(skip);
  return country;
}
