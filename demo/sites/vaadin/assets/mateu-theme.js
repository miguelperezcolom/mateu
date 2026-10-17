// The page's language and theme, applied BEFORE the first paint (no flash of the wrong theme).
// A file, not an inline script, so the page runs under a Content Security Policy without
// 'unsafe-inline' (see the security guide). Loaded as a classic, blocking script from <head>.
(function () {
  // the page language: the browser's until the app shell says the server's (AppDto.locale)
  if (!document.documentElement.lang) document.documentElement.lang = navigator.language || 'en';
  var saved = null;
  try { saved = localStorage.getItem('mateu-theme'); } catch (e) { /* storage blocked */ }
  if (saved) {
    document.documentElement.setAttribute('theme', saved);
  } else if (window.matchMedia) {
    document.documentElement.setAttribute('theme',
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      var stored = null;
      try { stored = localStorage.getItem('mateu-theme'); } catch (e) { /* storage blocked */ }
      if (!stored) {
        document.documentElement.setAttribute('theme', e.matches ? 'dark' : 'light');
      }
    });
  }
})();
