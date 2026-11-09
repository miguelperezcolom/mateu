// The app's re-auth flow: Mateu raises `mateu-session-expired` when a request answers 401, and
// retries that SAME request once after `retry()` — the page never navigates, nothing typed is lost.
// A real app would open its login popup / refresh its token here; this demo asks, then "signs in"
// by storing a fresh token where Mateu reads the Bearer from.
document.addEventListener('mateu-session-expired', (e) => {
  e.preventDefault(); // claim it: we handle the re-authentication
  const { retry, giveUp } = e.detail;
  if (window.confirm('Your session expired. Sign in again? (demo)')) {
    localStorage.setItem('__mateu_auth_token', 'demo-' + Date.now());
    retry();
  } else {
    giveUp();
  }
});

// Loaded through an Element's `import`, which expects the module to define its tag.
if (!customElements.get('demo-session-handler')) {
  customElements.define('demo-session-handler', class extends HTMLElement {});
}
