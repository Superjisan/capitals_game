export function buildAnswerRow(country, capitalText, answer, correct) {
  const tbodyElem = document.getElementById('answers-body');
  const trElem = document.createElement('tr');

  const countryTd = document.createElement('td');
  countryTd.innerText = country;
  const capitalTd = document.createElement('td');
  capitalTd.innerText = capitalText;
  trElem.appendChild(countryTd);
  trElem.appendChild(capitalTd);

  trElem.style.backgroundColor = correct ? 'lightgreen' : 'lightcoral';
  const resultTd = document.createElement('td');
  resultTd.innerText = correct ? 'Correct' : 'Wrong';
  trElem.appendChild(resultTd);

  const yourAnswerTd = document.createElement('td');
  yourAnswerTd.innerText = answer;
  trElem.appendChild(yourAnswerTd);

  tbodyElem.appendChild(trElem);
}

export function clearAnswersTable() {
  const tbodyElem = document.getElementById('answers-body');
  while (tbodyElem.firstChild) {
    tbodyElem.removeChild(tbodyElem.firstChild);
  }
}
