import { assert, assertEquals, assertRejects } from 'jsr:@std/assert@1';

const SCOPE = 'https://example.com/capitals_game/';
const swSource = await Deno.readTextFile(new URL('../js/sw.js', import.meta.url));

function loadServiceWorker({ network = {} } = {}) {
  const listeners = {};
  const stores = new Map();
  const fetched = [];
  const store = (name) => {
    if (!stores.has(name)) {
      stores.set(name, new Map());
    }
    return stores.get(name);
  };
  const keyOf = (request) => (typeof request === 'string' ? request : request.url);
  const caches = {
    open: (name) => Promise.resolve({
      addAll: (urls) => {
        urls.forEach((url) => store(name).set(url, new Response(`precached ${url}`)));
        return Promise.resolve();
      },
      match: (request) => {
        const hit = store(name).get(keyOf(request));
        return Promise.resolve(hit ? hit.clone() : undefined);
      },
      put: (request, response) => {
        store(name).set(keyOf(request), response);
        return Promise.resolve();
      },
    }),
    keys: () => Promise.resolve([...stores.keys()]),
    delete: (name) => Promise.resolve(stores.delete(name)),
  };
  const self = {
    registration: { scope: SCOPE },
    location: new URL(`${SCOPE}js/sw.js`),
    addEventListener: (type, handler) => {
      listeners[type] = handler;
    },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve() },
  };
  const fetchStub = (request) => {
    fetched.push(request.url);
    if (request.url in network) {
      return Promise.resolve(new Response(network[request.url]));
    }
    return Promise.reject(new TypeError('offline'));
  };
  new Function('self', 'caches', 'fetch', swSource)(self, caches, fetchStub);

  const dispatch = async (type, event) => {
    let pending;
    listeners[type]({ ...event, waitUntil: (p) => (pending = p), respondWith: (p) => (pending = p) });
    return pending;
  };
  return { stores, fetched, listeners, dispatch };
}

const fakeRequest = (url, { method = 'GET', mode = 'cors' } = {}) => ({ url, method, mode });

Deno.test('install precaches every file the offline game needs', async () => {
  const sw = loadServiceWorker();
  await sw.dispatch('install', {});

  const cached = [...sw.stores.get('capitals-game-v1').keys()];
  for (const path of ['index.html', 'styles.css', 'data/capitals.json', 'js/main.js', 'maps/england.svg', 'manifest.json']) {
    assert(cached.includes(`${SCOPE}${path}`), `${path} should be precached`);
  }
  assert(cached.includes(SCOPE), 'the scope root should be precached');
});

Deno.test('every precached path exists on disk and every js and maps file is precached', async () => {
  const listed = [...swSource.matchAll(/^ {2}'([^']+)',$/gm)].map((match) => match[1]).filter((path) => path !== './');
  for (const path of listed) {
    await Deno.stat(new URL(`../${path}`, import.meta.url));
  }
  for (const dir of ['js', 'maps']) {
    for await (const entry of Deno.readDir(new URL(`../${dir}/`, import.meta.url))) {
      if (entry.name === 'sw.js') {
        continue;
      }
      assert(listed.includes(`${dir}/${entry.name}`), `${dir}/${entry.name} is missing from PRECACHE_PATHS`);
    }
  }
});

Deno.test('activate deletes caches from older versions', async () => {
  const sw = loadServiceWorker();
  sw.stores.set('capitals-game-v0', new Map());
  await sw.dispatch('install', {});
  await sw.dispatch('activate', {});

  assertEquals([...sw.stores.keys()], ['capitals-game-v1']);
});

Deno.test('offline, a precached file is served from the cache', async () => {
  const sw = loadServiceWorker();
  await sw.dispatch('install', {});

  const response = await sw.dispatch('fetch', { request: fakeRequest(`${SCOPE}data/capitals.json`) });
  assertEquals(await response.text(), `precached ${SCOPE}data/capitals.json`);
});

Deno.test('online, the cached copy is refreshed in the background', async () => {
  const url = `${SCOPE}styles.css`;
  const sw = loadServiceWorker({ network: { [url]: 'new css' } });
  await sw.dispatch('install', {});

  await sw.dispatch('fetch', { request: fakeRequest(url) });
  await new Promise((resolve) => setTimeout(resolve, 0));

  assertEquals(await sw.stores.get('capitals-game-v1').get(url).text(), 'new css');
});

Deno.test('offline, an uncached navigation falls back to index.html', async () => {
  const sw = loadServiceWorker();
  await sw.dispatch('install', {});

  const response = await sw.dispatch('fetch', { request: fakeRequest(`${SCOPE}somewhere`, { mode: 'navigate' }) });
  assertEquals(await response.text(), `precached ${SCOPE}index.html`);
});

Deno.test('offline, an uncached non-navigation request fails', async () => {
  const sw = loadServiceWorker();
  await sw.dispatch('install', {});

  await assertRejects(() => sw.dispatch('fetch', { request: fakeRequest(`${SCOPE}unknown.json`) }));
});

Deno.test('cross-origin and non-GET requests are left to the browser', () => {
  const sw = loadServiceWorker();
  let responded = false;
  const respondWith = () => (responded = true);
  sw.listeners.fetch({ request: fakeRequest('https://flagcdn.com/fr.svg'), respondWith });
  sw.listeners.fetch({ request: fakeRequest(`${SCOPE}index.html`, { method: 'POST' }), respondWith });

  assertEquals(responded, false);
  assertEquals(sw.fetched, []);
});
