import { getAliases } from './game_state.js';

let suggestionIndex = -1;

export function populateCapitalsDatalist(capitals) {
  const datalistElem = document.getElementById('capitals-list');
  const seen = new Set();

  while (datalistElem.firstChild) {
    datalistElem.removeChild(datalistElem.firstChild);
  }

  Object.entries(capitals).forEach(([country, capital]) => {
    const names = Array.isArray(capital) ? capital : [capital];
    for (const entry of [...names, ...getAliases(country)]) {
      if (seen.has(entry)) {
        continue;
      }
      seen.add(entry);
      const optionElem = document.createElement('option');
      optionElem.value = entry;
      datalistElem.appendChild(optionElem);
    }
  });

  renderCapitalSuggestions();
}

function setActiveSuggestion(suggestions, index) {
  const buttons = [...suggestions.querySelectorAll('.capital-suggestion')];
  if (!buttons.length) {
    suggestionIndex = -1;
    return;
  }

  suggestionIndex = Math.max(0, Math.min(index, buttons.length - 1));

  buttons.forEach((button, buttonIndex) => {
    button.classList.toggle('active', buttonIndex === suggestionIndex);
  });
}

export function renderCapitalSuggestions() {
  const input = document.getElementById('answer');
  const suggestions = document.getElementById('answer-suggestions');
  if (!input || !suggestions) {
    return;
  }

  const query = input.value.trim().toLowerCase();
  const values = [...document.querySelectorAll('#capitals-list option')].map((option) => option.value);
  const matches = query
    ? values.filter((value) => value.toLowerCase().includes(query)).slice(0, 12)
    : [];

  suggestions.innerHTML = '';
  if (!matches.length) {
    suggestions.hidden = true;
    suggestionIndex = -1;
    return;
  }

  matches.forEach((value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'capital-suggestion';
    button.textContent = value;
    button.addEventListener('mousedown', (event) => {
      event.preventDefault();
      input.value = value;
      suggestions.hidden = true;
      suggestionIndex = -1;
      input.focus();
    });
    suggestions.appendChild(button);
  });

  suggestionIndex = -1;
  suggestions.hidden = false;
}

export function bindCapitalSuggestions() {
  const input = document.getElementById('answer');
  const suggestions = document.getElementById('answer-suggestions');
  if (!input || !suggestions) {
    return;
  }

  input.addEventListener('input', renderCapitalSuggestions);
  input.addEventListener('focus', renderCapitalSuggestions);
  input.addEventListener('keydown', (event) => {
    if (suggestions.hidden) {
      return;
    }

    const buttons = [...suggestions.querySelectorAll('.capital-suggestion')];
    if (!buttons.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopImmediatePropagation();
      const nextIndex = suggestionIndex >= 0 ? (suggestionIndex + 1) % buttons.length : 0;
      setActiveSuggestion(suggestions, nextIndex);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopImmediatePropagation();
      const nextIndex = suggestionIndex >= 0 ? (suggestionIndex - 1 + buttons.length) % buttons.length : buttons.length - 1;
      setActiveSuggestion(suggestions, nextIndex);
      return;
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      suggestions.hidden = true;
      suggestionIndex = -1;
    }, 150);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (target !== input && !suggestions.contains(target)) {
      suggestions.hidden = true;
      suggestionIndex = -1;
    }
  });
}
