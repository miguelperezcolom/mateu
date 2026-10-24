/**
 * Version skew — "this app was redeployed while you had it open".
 *
 * Every Mateu response carries `X-Mateu-Build`, an opaque fingerprint of the deployed UI. Per
 * BACKEND (the request URL up to its `/mateu/` segment) the first build seen this page session is
 * the baseline; a later successful response with another build means the app was updated under the
 * user → one sticky notice per backend with a Reload control. A Mateu 403 refusal from another build
 * is almost certainly a STALE screen (the action or view it calls no longer exists in that shape),
 * not a missing permission → the refusal is reported as such, with the same Reload, instead of
 * "you are not allowed".
 *
 * In memory only: a reload starts a new session with the then-current build as its baseline.
 * A response without the header (a static bundle, an older server) changes nothing.
 */
import { notify } from '@application/Notifier.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'

export const BUILD_HEADER = 'x-mateu-build'

export type BuildVerdict = 'none' | 'updated' | 'stale'

/** The backend a Mateu URL belongs to: its absolute form up to (excluding) the `/mateu/` segment. */
export function backendKeyOf(url: string, base?: string): string | undefined {
    let href = url
    try {
        const fallbackBase = base ?? (typeof window !== 'undefined' && window.location ? window.location.href : undefined)
        href = new URL(url, fallbackBase).href
    } catch {
        // not resolvable — keep it as written
    }
    const at = href.indexOf('/mateu/')
    return at < 0 ? undefined : href.substring(0, at)
}

/** Reads the build off whatever headers object the transport has (axios, fetch, a plain map). */
export function buildOf(headers: unknown): string | undefined {
    if (!headers || typeof headers !== 'object') return undefined
    const h = headers as { get?: (name: string) => unknown } & Record<string, unknown>
    let value: unknown
    if (typeof h.get === 'function') {
        try { value = h.get(BUILD_HEADER) } catch { value = undefined }
    }
    if (value === undefined || value === null) {
        const key = Object.keys(h).find((k) => k.toLowerCase() === BUILD_HEADER)
        value = key ? h[key] : undefined
    }
    if (typeof value !== 'string') return undefined
    const build = value.trim()
    return build === '' ? undefined : build
}

/** The per-session baselines and which backends were already told about an update. */
export class BuildWatch {
    private readonly baselines = new Map<string, string>()
    private readonly noticeShown = new Set<string>()

    /**
     * Decides what one Mateu response means. `refusal` = it is Mateu's own 403. Only a successful
     * response or a refusal should be passed (other failures say nothing about the screen).
     */
    observe(key: string | undefined, build: string | undefined, refusal = false): BuildVerdict {
        if (!key || !build) return 'none'
        const baseline = this.baselines.get(key)
        if (baseline === undefined) {
            this.baselines.set(key, build)
            return 'none'
        }
        if (baseline === build) return 'none'
        if (refusal) {
            // the stale-screen message stands in for the update notice: never show both
            this.noticeShown.add(key)
            return 'stale'
        }
        if (this.noticeShown.has(key)) return 'none'
        this.noticeShown.add(key)
        return 'updated'
    }

    reset(): void {
        this.baselines.clear()
        this.noticeShown.clear()
    }
}

export const buildWatch = new BuildWatch()

/** Reload the page — the only way to get the new deployment's client and screens. */
export const reloadPage = (): void => {
    if (typeof window !== 'undefined') window.location.reload()
}

const defaultNotice = (): void => {
    if (typeof document === 'undefined' || !document.body) return
    // sticky (duration 0) and non-blocking: the user finishes what they are doing, then reloads
    notify({
        text: chromeText('appUpdated'), variant: 'info', position: 'bottomEnd', duration: 0,
        actionLabel: chromeText('reload'), onAction: reloadPage,
    }, document.body)
}

/**
 * Feeds a SUCCESSFUL Mateu response to the watch and shows the update notice the first time a
 * backend answers from another build. Returns the verdict (for tests).
 */
export function observeMateuResponse(url: string, headers: unknown,
                                     showNotice: () => void = defaultNotice): BuildVerdict {
    const verdict = buildWatch.observe(backendKeyOf(url), buildOf(headers))
    if (verdict === 'updated') showNotice()
    return verdict
}

/** Whether Mateu's own 403 came from another build than the one the screen was opened from. */
export function isStaleScreenRefusal(url: string, headers: unknown): boolean {
    return buildWatch.observe(backendKeyOf(url), buildOf(headers), true) === 'stale'
}

/** Marker the transport puts on a refusal it judged stale; requestPolicy reads it. */
export const STALE_SCREEN = '__mateuStaleScreen'

export const isMarkedStaleScreen = (error: unknown): boolean =>
    !!error && typeof error === 'object' && (error as Record<string, unknown>)[STALE_SCREEN] === true
