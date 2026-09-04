export function populateCapitalsDatalist(capitals) {
  const datalistElem = document.getElementById('capitals-list');
  Object.values(capitals).flat().forEach((capital) => {
    const optionElem = document.createElement('option');
    optionElem.value = capital;
    datalistElem.appendChild(optionElem);
  });
}
