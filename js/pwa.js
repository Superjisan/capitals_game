export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  window.addEventListener('load', () => {
    // scope must be set explicitly since sw.js now lives under js/, which would
    // otherwise limit it to controlling only pages under js/ instead of the whole site
    navigator.serviceWorker.register('/capitals_game/js/sw.js', { scope: '/capitals_game/' })
      .then((reg) => console.log('Service Worker registered!', reg))
      .catch((err) => console.log('Registration failed: ', err));
  });
}
