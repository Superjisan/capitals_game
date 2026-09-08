const STORAGE_KEY = 'capitalsGameState';

export const STUDY_IMAGE_CHOICES = ['map', 'flag', 'both'];

export function saveGameState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadGameState(isValidMode) {
  let state;
  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (err) {
    return null;
  }
  if (!state || !isValidMode(state.mode) || !Array.isArray(state.countriesPlayed)) {
    return null;
  }
  return state;
}

export function saveGameMode(mode) {
  localStorage.setItem(`${STORAGE_KEY}.mode`, JSON.stringify(mode));
}

export function loadGameMode() {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_KEY}.mode`)) ?? 'play';
  } catch {
    return 'play';
  }
}

export function saveStudyImages(preference) {
  localStorage.setItem(`${STORAGE_KEY}.studyImages`, JSON.stringify(preference));
}

export function loadStudyImages() {
  try {
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY}.studyImages`));
    return STUDY_IMAGE_CHOICES.includes(saved) ? saved : 'both';
  } catch {
    return 'both';
  }
}
