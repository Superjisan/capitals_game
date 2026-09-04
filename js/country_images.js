import { COUNTRY_ISO_CODES, FALLBACK_FLAG_SLUGS } from './country_iso_codes.js';

export function updateCountryMap(country) {
  const mapElem = document.getElementById('country-map');
  const isoCode = COUNTRY_ISO_CODES[country];
  if (!isoCode) {
    mapElem.hidden = true;
    return;
  }
  mapElem.src = `https://raw.githubusercontent.com/djaiss/mapsicon/master/all/${isoCode}/vector.svg`;
  mapElem.hidden = false;
}

export function updateCountryFlag(country) {
  const flagElem = document.getElementById('country-flag');
  const isoCode = COUNTRY_ISO_CODES[country];
  if (isoCode) {
    flagElem.src = `https://flagcdn.com/${isoCode}.svg`;
    flagElem.hidden = false;
    return;
  }
  const fallbackSlug = FALLBACK_FLAG_SLUGS[country];
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
