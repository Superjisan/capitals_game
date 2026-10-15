import { getCountryIso, getMapOverride, getFlagSlug } from './game_state.js';

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

// mapsicon's own map for a country is used unless capitals.json overrides it,
// which it does where mapsicon master has no map or draws the wrong borders.
export function mapUrl(country) {
  const override = getMapOverride(country);
  if (override) {
    return override;
  }
  const isoCode = getCountryIso(country);
  return isoCode ? `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${isoCode}/vector.svg` : null;
}

export function updateCountryMap(country) {
  const mapElem = document.getElementById('country-map');
  const source = mapUrl(country);
  if (!source || navigator.onLine === false || !isVisible('map')) {
    mapElem.hidden = true;
    return;
  }
  mapElem.src = source;
  mapElem.hidden = false;
}

export function flagUrl(country) {
  const slug = getFlagSlug(country);
  if (slug) {
    return `https://worldflags.net/assets/img/flags/${slug}-flag.png`;
  }
  const isoCode = getCountryIso(country);
  return isoCode ? `https://flagcdn.com/${isoCode}.svg` : null;
}

export function updateCountryFlag(country) {
  const flagElem = document.getElementById('country-flag');
  const source = flagUrl(country);
  if (!source || navigator.onLine === false || !isVisible('flag')) {
    flagElem.hidden = true;
    return;
  }
  flagElem.src = source;
  flagElem.hidden = false;
}

export function registerCountryImageErrorHandlers() {
  document.getElementById('country-map').addEventListener('error', function () {
    this.hidden = true;
  });
  document.getElementById('country-flag').addEventListener('error', function () {
    this.hidden = true;
  });
  window.addEventListener('offline', () => {
    document.getElementById('country-map').hidden = true;
    document.getElementById('country-flag').hidden = true;
  });
  window.addEventListener('online', () => {
    const country = document.getElementById('country').innerText;
    if (country) {
      updateCountryMap(country);
      updateCountryFlag(country);
    }
  });
}
