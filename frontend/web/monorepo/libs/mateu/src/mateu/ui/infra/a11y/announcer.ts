/**
 * Screen-reader announcer — one live region for the whole document.
 *
 * A single-page app changes what is on screen without changing the page, so a screen reader has
 * nothing to announce: navigation, a failed save, a listing that just re-searched all happen in
 * silence. The user is told nothing until they go looking.
 *
 * A live region fixes that, but only if there is exactly ONE per politeness level and it exists
 * BEFORE the text goes into it — a region created and filled in the same tick is frequently not
 * announced at all, because assistive technology watches for mutations of regions it already
 * knows about. Hence: created once, up front, and only ever mutated.
 *
 * Politeness is not decoration. `polite` waits for a pause and is right for "12 results" or
 * "Invoices page"; `assertive` interrupts and is for things the user must not miss, like a save
 * that failed. Using assertive for routine updates makes the app unusable, so it is opt-in.
 */

type Politeness = 'polite' | 'assertive'

const regions = new Map<Politeness, HTMLElement>()

const REGION_STYLE = [
    'position:absolute',
    'width:1px',
    'height:1px',
    'margin:-1px',
    'padding:0',
    'overflow:hidden',
    // `clip` is the legacy form; `clip-path` the modern one. Both, because screen readers ignore
    // regions hidden with display:none or visibility:hidden — this is the one hiding technique
    // that keeps the text available to assistive technology.
    'clip:rect(0 0 0 0)',
    'clip-path:inset(50%)',
    'white-space:nowrap',
    'border:0',
].join(';')

const regionFor = (politeness: Politeness): HTMLElement | undefined => {
    if (typeof document === 'undefined' || !document.body) return undefined
    let region = regions.get(politeness)
    if (region?.isConnected) return region
    region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    // "all" so a text replacement is read in full rather than only the changed words.
    region.setAttribute('aria-atomic', 'true')
    region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
    region.setAttribute('data-mateu-live-region', politeness)
    region.style.cssText = REGION_STYLE
    document.body.appendChild(region)
    regions.set(politeness, region)
    return region
}

/** Creates the live regions ahead of time. Called by the composition root. */
export const installAnnouncer = (): void => {
    if (typeof document === 'undefined') return
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', () => installAnnouncer(), { once: true })
        return
    }
    regionFor('polite')
    regionFor('assertive')
}

/**
 * Announces `message` to assistive technology. Nothing is shown on screen.
 *
 * Repeating the identical string is a real case (two failed saves in a row), and a live region
 * whose text does not change announces nothing — so an unchanged message is re-set after a beat
 * to force the mutation.
 */
export const announce = (message: string, options: { politeness?: Politeness } = {}): void => {
    const text = (message ?? '').trim()
    if (!text) return
    const region = regionFor(options.politeness ?? 'polite')
    if (!region) return
    if (region.textContent === text) {
        region.textContent = ''
        setTimeout(() => { region.textContent = text }, 60)
        return
    }
    region.textContent = text
}

/** Test seam: forgets the regions (and removes them from the document). */
export const resetAnnouncer = (): void => {
    regions.forEach((region) => region.remove())
    regions.clear()
}
