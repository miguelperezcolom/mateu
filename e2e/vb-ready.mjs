/**
 * Waiting for the VB/Redwood renderer to be READY, shared by the vb-* probes.
 *
 * Why not `page.goto(url, { waitUntil: 'networkidle' })`: the app loads JET, oj-sp and the
 * visual-runtime from Oracle's CDN (static.oracle.com, never vendored), and on a slow CDN minute the
 * network does not go idle for 500ms within the navigation timeout — the probe then failed on
 * `page.goto: Timeout 60000ms exceeded` with the app itself perfectly fine. Networkidle also says
 * nothing about the app: it can be idle before the first Mateu load has even been sent.
 *
 * Ready means what the probes actually need, read from the page:
 *  - the shell has booted: loadMateuShell installs the two live regions at boot
 *    (`[data-mateu-live-region]`, poc/a11y.mjs);
 *  - no Mateu request is in flight: the busy bar (`.mateu-busy-bar`) and the loading skeleton
 *    (`.mateu-skeleton`) are only in the DOM while one is;
 *  - optionally, the texts the screen must show.
 *
 * The first navigation is retried once (bounded): a CDN hiccup on one attempt should not fail a
 * probe whose subject is the renderer, while a renderer that never becomes ready still fails.
 */
export const isVbReady = async (page, texts = []) =>
  page.evaluate((texts) => {
    if (document.querySelectorAll('[data-mateu-live-region]').length < 2) return false
    if (document.querySelector('.mateu-busy-bar, .mateu-skeleton')) return false
    const shown = document.body ? document.body.innerText : ''
    return texts.every((t) => shown.includes(t))
  }, texts).catch(() => false)

/** Polls until the app is ready (see above) or `timeout` ms elapse. Returns whether it got there. */
export const waitForVbReady = async (page, { texts = [], timeout = 45000 } = {}) => {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await isVbReady(page, texts)) return true
    await page.waitForTimeout(250)
  }
  return false
}

/**
 * Navigates to `url` and waits for the app to be ready, retrying the navigation once. Throws when
 * it never gets ready, naming what was missing.
 */
export const gotoVbReady = async (page, url, { texts = [], timeout = 45000, attempts = 2 } = {}) => {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
      if (await waitForVbReady(page, { texts, timeout })) return
      lastError = new Error(`${url} was not ready after ${timeout}ms${texts.length ? ` (expected ${JSON.stringify(texts)})` : ''}`)
    } catch (e) {
      lastError = e
    }
    if (attempt < attempts) console.log(`  (attempt ${attempt} to load ${url} failed: ${String(lastError.message).split('\n')[0]} — retrying once)`)
  }
  throw lastError
}
