/* Mateu service worker, switched OFF (io.mateu.core.infra.Pwa): what the worker's URL answers when
 * the app is no longer a Progressive Web App (mateu.pwa.enabled=false, a bundle built with
 * -Dmateu.bundle.pwa=false, development mode). A browser that installed the worker before fetches
 * this on its next update check: it deletes the worker's caches and unregisters itself. It handles
 * no request, so the page it was controlling just goes to the network. Apache License 2.0. */
'use strict';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  const prefix = 'mateu-pwa:' + self.registration.scope + ':';
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(prefix)).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister()),
  );
});
