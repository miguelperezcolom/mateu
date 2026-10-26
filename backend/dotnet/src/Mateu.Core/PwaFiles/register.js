/* Registers the Mateu service worker (io.mateu.core.infra.Pwa). Apache License 2.0.
 * The page carries it as <script src="…/register.js" data-sw="<worker url>" data-scope="<scope>"
 * defer>: an external file, so a page under script-src 'self' needs no inline-script hash.
 * Not registered in a frame (the IDE editors' previews, an embedding page) nor on an insecure
 * origin: an installed app is a top-level window. */
(function () {
  'use strict';
  var me = document.currentScript;
  if (!me || !('serviceWorker' in navigator) || !window.isSecureContext) {
    return;
  }
  try {
    if (window.top !== window.self) {
      return;
    }
  } catch (e) {
    return; // a cross-origin parent: framed
  }
  var sw = me.getAttribute('data-sw');
  var scope = me.getAttribute('data-scope');
  if (!sw || !scope) {
    return;
  }
  // The worker takes over a page that loaded without it (the first visit, or the visit that brings
  // a new build): it is handed the files the page loaded, to cache them for the next offline visit.
  navigator.serviceWorker.addEventListener('controllerchange', function () {
    var controller = navigator.serviceWorker.controller;
    if (!controller || !window.performance || !performance.getEntriesByType) {
      return;
    }
    var files = performance.getEntriesByType('resource').map(function (entry) {
      return { url: entry.name, initiator: entry.initiatorType };
    });
    controller.postMessage({ type: 'mateu-pwa-warm', files: files });
  });
  function register() {
    navigator.serviceWorker.register(sw, { scope: scope }).catch(function (error) {
      console.warn('mateu: the service worker could not be registered', error);
    });
  }
  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register);
  }
})();
