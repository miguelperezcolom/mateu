// Wire-version check — the same rule as the web renderer (libs/mateu infra/http/wireVersion.ts).
//
// Every response of a Mateu backend carries `wireVersion` ("3.0" today). The wire is additive within
// a MAJOR: a newer minor only adds optional fields, component types and commands, which this renderer
// ignores (unknown fields) or draws as the "Unsupported component" placeholder (unknown types). A
// different MAJOR may have removed or changed what this renderer relies on, so instead of a
// half-broken screen the user is told, once, in plain words, that server and renderer do not match.
// A response without the field (a backend older than the field) is accepted silently.
//
// The transport calls observeWireVersion on every response; the shell (loadMateuShell.js) registers
// the listener that shows the message in the error band.

import { chromeText } from './i18n.mjs'

/** The wire major this renderer was built for. */
export const SUPPORTED_WIRE_MAJOR = 3

/** Same major → ok; another major → not ok. Unparseable or absent → ok (nothing to judge). */
export function checkWireVersion(received, supportedMajor = SUPPORTED_WIRE_MAJOR) {
  if (typeof received !== 'string' || received.trim() === '') return { ok: true }
  const major = parseInt(received.trim().split('.')[0], 10)
  if (!Number.isFinite(major)) return { ok: true }
  return major === supportedMajor ? { ok: true } : { ok: false, serverMajor: major, received: received.trim() }
}

/** The user-facing text for a mismatch, in the interface's language. */
export function wireMismatchMessage(serverMajor, supportedMajor = SUPPORTED_WIRE_MAJOR, lang) {
  return chromeText('wireVersionMismatch', { server: `${serverMajor}.x`, supported: `${supportedMajor}.x` }, lang)
}

const wireVersionState = { reported: false, listener: null }

/** The shell's hook: called ONCE per page with the message of the first mismatch. */
export function setWireMismatchListener(fn) {
  wireVersionState.listener = typeof fn === 'function' ? fn : null
}

/** Inspect a response body; report the first mismatch of the page. Rendering goes on regardless. */
export function observeWireVersion(body) {
  if (!body || typeof body !== 'object') return { ok: true }
  const check = checkWireVersion(body.wireVersion)
  if (!check.ok && !wireVersionState.reported) {
    wireVersionState.reported = true
    const message = wireMismatchMessage(check.serverMajor)
    if (typeof console !== 'undefined') console.error('[mateu] ' + message)
    if (wireVersionState.listener) {
      try { wireVersionState.listener(message) } catch (e) { /* the UI must not break the transport */ }
    }
  }
  return check
}

/** Test hook: forget that a mismatch was already reported. */
export function resetWireVersionCheck() {
  wireVersionState.reported = false
}
