/**
 * Wire-version check (pure logic + a once-per-page reporter).
 *
 * Every response of a Mateu backend carries `wireVersion` ("3.0" today). The wire is additive
 * within a MAJOR: a newer minor only adds optional fields, component types and commands, which this
 * renderer ignores (unknown fields) or draws as a placeholder (unknown types). A different MAJOR may
 * have removed or changed what this renderer relies on, so instead of a half-broken screen the user
 * is told, once, in plain words, that the server and the renderer do not match.
 *
 * A response without the field (a backend older than the field) is accepted silently.
 */
import { notify } from '@application/Notifier.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

/** The wire major this renderer was built for. */
export const SUPPORTED_WIRE_MAJOR = 3

export type WireCheck = { ok: true } | { ok: false; serverMajor: number; received: string }

/** Same major → ok; another major → not ok. Unparseable or absent → ok (nothing to judge). */
export function checkWireVersion(received: unknown, supportedMajor: number = SUPPORTED_WIRE_MAJOR): WireCheck {
    if (typeof received !== 'string' || received.trim() === '') return { ok: true }
    const major = parseInt(received.trim().split('.')[0] ?? '', 10)
    if (!Number.isFinite(major)) return { ok: true }
    return major === supportedMajor ? { ok: true } : { ok: false, serverMajor: major, received: received.trim() }
}

/** The user-facing text for a mismatch, in the page's chrome language. */
export function wireMismatchMessage(serverMajor: number, supportedMajor: number = SUPPORTED_WIRE_MAJOR): string {
    return chromeTextf('wireVersionMismatch', { server: `${serverMajor}.x`, supported: `${supportedMajor}.x` })
}

let reported = false

const defaultReport = (message: string): void => {
    console.error('[mateu] ' + message)
    if (typeof document !== 'undefined' && document.body) {
        // persistent (the mismatch does not go away by itself), with a control to dismiss it
        notify({
            text: message, variant: 'error', position: 'topStretch', duration: 0,
            actionLabel: chromeText('dismiss'), onAction: () => undefined,
        }, document.body)
    }
}

/**
 * Inspect a response body; on the FIRST mismatch of the page, report it (console + a persistent
 * error toast). Rendering goes on regardless — unknown fields and types are still tolerated.
 */
export function observeWireVersion(body: unknown, report: (message: string) => void = defaultReport): WireCheck {
    if (!body || typeof body !== 'object') return { ok: true }
    const check = checkWireVersion((body as Record<string, unknown>)['wireVersion'])
    if (!check.ok && !reported) {
        reported = true
        report(wireMismatchMessage(check.serverMajor))
    }
    return check
}

/** Test hook: forget that a mismatch was already reported. */
export function resetWireVersionCheck(): void {
    reported = false
}
