/* Mateu service worker (io.mateu.core.infra.Pwa) — makes the UI installable and gives it an
 * offline shell. Apache License 2.0.
 *
 * NETWORK FIRST, always: while online every request it handles goes to the network exactly as it
 * would without it, and the cache only answers when the network fails. So a new deploy is never
 * hidden behind a cached copy, and the cache is one per build (?v=) — the worker of the next build
 * deletes this one's.
 *
 * What it caches (GET only, responses not marked no-store):
 *  - the shell page (the scope's start URL), and serves it for any page of the scope when offline;
 *  - files under the folders the shell page loads its own files from (?s=, e.g. /assets/,
 *    /_redwood/, a CDN folder) and the files named in ?p= (a static bundle's manifest.json);
 *  - scripts, stylesheets and fonts from anywhere; same-origin images that are plain files.
 * What it never touches: anything but GET, the Mateu API (any /mateu/ path), and every other
 * fetch()/XHR — the data of named REST sources, which may be personal or need a token, is never
 * stored.
 */
'use strict';

const params = new URL(self.location.href).searchParams;
const VERSION = params.get('v') || '0';
const SCOPE = self.registration.scope;
const PREFIX = 'mateu-pwa:' + SCOPE + ':';
const CACHE = PREFIX + VERSION;
const SHELL = SCOPE;
const STATIC = params.getAll('s').map((s) => new URL(s, self.location.href).href);
const PRECACHE = params.getAll('p').map((p) => new URL(p, self.location.href).href);
const IMAGE = /\.(png|jpe?g|gif|svg|webp|avif|ico)$/i;
const FONT = /\.(woff2?|ttf|otf|eot)$/i;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        [SHELL, ...PRECACHE].map((url) =>
          fetch(url, {
            credentials: 'same-origin',
            cache: 'no-cache',
            headers: url === SHELL ? { Accept: 'text/html' } : {},
          })
            .then((response) => (storable(response) ? cache.put(url, response) : undefined))
            .catch(() => undefined),
        ),
      ),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const kind = handled(request.url, request.method, request.mode, request.destination);
  if (kind) {
    event.respondWith(networkFirst(request, kind === 'page'));
  }
});

/** 'page', 'file' or '' (not handled at all): whether, and how, a request is handled. */
function handled(href, method, mode, destination) {
  if (method !== 'GET') {
    return '';
  }
  let url;
  try {
    url = new URL(href);
  } catch (e) {
    return '';
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return '';
  }
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin && url.pathname.includes('/mateu/')) {
    return ''; // the Mateu API of any mount, and its dev endpoints
  }
  if (mode === 'navigate') {
    return sameOrigin ? 'page' : '';
  }
  const bare = url.origin + url.pathname;
  if (PRECACHE.includes(bare) || STATIC.some((s) => bare.startsWith(s))) {
    return 'file';
  }
  if (destination === 'script' || destination === 'style' || destination === 'font') {
    return 'file';
  }
  if (sameOrigin && destination === 'image' && !url.search && IMAGE.test(url.pathname)) {
    return 'file';
  }
  return '';
}

function storable(response) {
  if (!response) {
    return false;
  }
  if (response.type === 'opaque') {
    return true; // a cross-origin script or stylesheet: nothing to read, kept as it came
  }
  return (
    response.ok &&
    response.status !== 206 &&
    !response.redirected &&
    !/no-store/i.test(response.headers.get('Cache-Control') || '')
  );
}

async function networkFirst(request, page) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (storable(response) && (!page || request.url === SHELL)) {
      cache.put(page ? SHELL : request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch (error) {
    const hit = page ? await cache.match(SHELL) : await cache.match(request);
    if (hit) {
      return hit;
    }
    throw error;
  }
}

/* The files the page loaded BEFORE this worker controlled it (its very first visit, or the visit
 * that brought a new build), sent by register.js: fetched again into the cache, so the next visit
 * opens offline too. Same rules as the fetch handler. */
self.addEventListener('message', (event) => {
  // only a page of this origin (register.js) hands it files to fetch
  if (event.origin !== self.location.origin) {
    return;
  }
  const data = event.data;
  if (data?.type !== 'mateu-pwa-warm' || !Array.isArray(data.files)) {
    return;
  }
  event.waitUntil(warm(data.files.slice(0, 500)));
});

function destinationOf(initiator, pathname) {
  if (initiator === 'script') {
    return 'script';
  }
  if (initiator === 'img' || initiator === 'image') {
    return 'image';
  }
  if (initiator === 'link' || initiator === 'css') {
    if (/\.css$/i.test(pathname)) return 'style';
    if (/\.m?js$/i.test(pathname)) return 'script';
    if (FONT.test(pathname)) return 'font';
    if (IMAGE.test(pathname)) return 'image';
  }
  return '';
}

/* One file after the other, not all at once: the page that sent them is still loading. */
async function warm(files) {
  const cache = await caches.open(CACHE);
  return files.reduce(
    (previous, file) => previous.then(() => warmOne(cache, file)),
    Promise.resolve(),
  );
}

/** The url of a file the page loaded that the fetch handler would cache, or null. */
function warmable(file) {
  if (!file || typeof file.url !== 'string') {
    return null;
  }
  let url;
  try {
    url = new URL(file.url);
  } catch (e) {
    return null;
  }
  const destination = destinationOf(String(file.initiator || ''), url.pathname);
  return handled(url.href, 'GET', 'no-cors', destination) === 'file' ? url : null;
}

async function warmOne(cache, file) {
  const url = warmable(file);
  if (!url || (await cache.match(url.href))) {
    return;
  }
  try {
    let response;
    if (url.origin === self.location.origin) {
      response = await fetch(url.href, { credentials: 'same-origin' });
    } else {
      // CORS first (a font needs it); a server that does not allow it gives an opaque copy
      response = await fetch(url.href, { mode: 'cors', credentials: 'omit' }).catch(() =>
        fetch(url.href, { mode: 'no-cors', credentials: 'omit' }),
      );
    }
    if (storable(response)) {
      await cache.put(url.href, response);
    }
  } catch (e) {
    // offline again, or refused: the next visit caches it on the way
  }
}
