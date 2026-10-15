const CACHE_NAME = 'capitals-game-v1';

const scopeUrl = (path) => new URL(path, self.registration.scope).href;

const PRECACHE_PATHS = [
  './',
  'index.html',
  'styles.css',
  'manifest.json',
  'data/capitals.json',
  'icons/android-chrome-192x192.png',
  'icons/android-chrome-512x512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-16x16.png',
  'icons/favicon-32x32.png',
  'icons/favicon.ico',
  'js/answers_table.js',
  'js/capitals_game.js',
  'js/country_images.js',
  'js/datalist.js',
  'js/game_state.js',
  'js/main.js',
  'js/persistence.js',
  'js/pwa.js',
  'js/share.js',
  'maps/england.svg',
  'maps/fm.svg',
  'maps/mh.svg',
  'maps/northern-ireland.svg',
  'maps/ps.svg',
  'maps/scotland.svg',
  'maps/tv.svg',
  'maps/wales.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_PATHS.map(scopeUrl)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  const refresh = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  if (cached) {
    refresh.catch(() => {});
    return cached;
  }
  try {
    return await refresh;
  } catch (error) {
    if (request.mode === 'navigate') {
      const shell = await cache.match(scopeUrl('index.html'));
      if (shell) {
        return shell;
      }
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});
