import { getCountryIso, getFallbackFlagSlug } from './game_state.js';

let visibleImages = 'both';

export function setVisibleImages(preference) {
  visibleImages = preference;
  const container = document.getElementById('country-images');
  if (container) {
    container.dataset.images = preference;
  }
}

export function getVisibleImages() {
  return visibleImages;
}

function isVisible(kind) {
  return visibleImages === 'both' || visibleImages === kind;
}

export function updateCountryMap(country) {
  const mapElem = document.getElementById('country-map');
  const isoCode = getCountryIso(country);
  if (!isoCode || !isVisible('map')) {
    mapElem.hidden = true;
    return;
  }
  mapElem.src = `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${isoCode}/vector.svg`;
  mapElem.hidden = false;
}

export function updateCountryFlag(country) {
  const flagElem = document.getElementById('country-flag');
  if (!isVisible('flag')) {
    flagElem.hidden = true;
    return;
  }
  const isoCode = getCountryIso(country);
  if (isoCode) {
    flagElem.src = `https://flagcdn.com/${isoCode}.svg`;
    flagElem.hidden = false;
    return;
  }
  const fallbackSlug = getFallbackFlagSlug(country);
  if (!fallbackSlug) {
    flagElem.hidden = true;
    return;
  }
  flagElem.src = `https://worldflags.net/assets/img/flags/${fallbackSlug}-flag.png`;
  flagElem.hidden = false;
}

export function registerCountryImageErrorHandlers() {
  document.getElementById('country-map').addEventListener('error', function () {
    this.hidden = true;
  });
  document.getElementById('country-flag').addEventListener('error', function () {
    this.hidden = true;
  });
}
