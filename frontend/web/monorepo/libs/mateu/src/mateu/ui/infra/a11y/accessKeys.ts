/**
 * Keyboard ACCESS KEYS (`@App(accessKeys = true)`): holding Alt shows a key next to every visible
 * button and tab — its declared shortcut when it has one (`data-shortcut`), otherwise a letter of
 * its label assigned without repeats — and Alt+that letter activates it. The back-office suites'
 * "hold the key to see the keys". The controls live inside nested shadow roots, so the candidates
 * are found by walking them; the badges go in one fixed layer on the document.
 */

/** The access letters for some labels: word initials first, then any letter, then digits; no
 *  repeats and skipping the reserved ones. '' when nothing is left. (Pure: tested in vitest.) */
export const assignAccessKeys = (labels: string[], reserved: string[] = []): string[] => {
    const used = new Set(reserved.map((k) => k.toLowerCase()))
    return labels.map((label) => {
        const text = (label || '').toLowerCase()
        const initials = text.split(/[^a-z0-9]+/).map((w) => w.charAt(0))
        for (const c of [...initials, ...text, ...'1234567890']) {
            if (/^[a-z0-9]$/.test(c) && !used.has(c)) { used.add(c); return c }
        }
        return ''
    })
}

/** "ctrl+alt+7" → "Ctrl+Alt+7" */
export const keyHint = (shortcut: string) => shortcut.split('+').filter(Boolean)
    .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')

const CANDIDATES = 'vaadin-button, vaadin-tab, vaadin-menu-bar-button, button.mateu-button, [data-access-key-target]'

type Candidate = { el: HTMLElement, label: string, declared: string, letter?: string }

const isShown = (el: HTMLElement) => {
    const rects = el.getClientRects()
    if (!rects.length) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight
}

const deepCandidates = (root: ParentNode, out: HTMLElement[] = []): HTMLElement[] => {
    root.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (el.matches(CANDIDATES)) out.push(el)
        if (el.shadowRoot) deepCandidates(el.shadowRoot, out)
    })
    return out
}

/** The shortcut an `@Action` declares for this button's action id: the owning mateu-component
 *  (found across shadow boundaries) carries the actions of its screen. */
const declaredByAction = (el: HTMLElement): string => {
    const actionId = el.getAttribute('data-action-id')
    if (!actionId) return ''
    let node: Node | null = el
    while (node) {
        if (node instanceof HTMLElement && node.localName === 'mateu-component') {
            const actions = ((node as unknown as { component?: { actions?: { id?: string, shortcut?: string }[] } }).component?.actions) ?? []
            const shortcut = actions.find((a) => a.id === actionId)?.shortcut
            if (shortcut) return shortcut
        }
        node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null)
    }
    return ''
}

const candidatesOf = (doc: Document): Candidate[] => deepCandidates(doc)
    .filter((el, i, all) => all.indexOf(el) === i)
    .filter((el) => isShown(el) && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true')
    .map((el) => ({
        el,
        label: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim(),
        declared: el.getAttribute('data-shortcut') || declaredByAction(el),
    }))
    .filter((c) => c.label)

let enabled = false
let installed = false
let current: Candidate[] = []

const hide = () => document.querySelectorAll('.mateu-access-keys').forEach((l) => l.remove())

const show = () => {
    hide()
    const candidates = candidatesOf(document)
    const reserved = candidates.map((c) => /^alt\+([a-z0-9])$/i.exec(c.declared)?.[1] ?? '').filter(Boolean)
    const free = candidates.filter((c) => !c.declared)
    assignAccessKeys(free.map((c) => c.label), reserved).forEach((letter, i) => { free[i].letter = letter })
    const layer = document.createElement('div')
    layer.className = 'mateu-access-keys'
    layer.setAttribute('aria-hidden', 'true')
    Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '10000' })
    for (const c of candidates) {
        const text = c.declared ? keyHint(c.declared) : (c.letter ?? '').toUpperCase()
        if (!text) continue
        const r = c.el.getBoundingClientRect()
        const badge = document.createElement('span')
        badge.textContent = text
        Object.assign(badge.style, {
            position: 'absolute', left: Math.max(0, r.left - 4) + 'px', top: Math.max(0, r.top - 8) + 'px',
            padding: '0 .3rem', borderRadius: '3px', font: '600 .7rem/1.2rem var(--lumo-font-family, sans-serif)',
            background: '#fcd34d', color: '#1a1a1a', boxShadow: '0 1px 3px rgba(0,0,0,.35)',
        })
        layer.appendChild(badge)
    }
    document.body.appendChild(layer)
    current = candidates.filter((c) => c.letter)
}

/** Turn the mode on or off (the app shell calls it with `app.accessKeys`). Installs once. */
export const syncAccessKeys = (on: boolean) => {
    enabled = !!on
    if (!enabled) hide()
    if (installed || !enabled) return
    installed = true
    let hold: ReturnType<typeof setTimeout> | undefined
    document.addEventListener('keydown', (e) => {
        if (!enabled) return
        if (e.key === 'Alt' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            if (!hold) hold = setTimeout(show, 250)
            return
        }
        if (hold) { clearTimeout(hold); hold = undefined }
        if (!e.altKey || e.ctrlKey || e.metaKey) return
        // by the physical key: on a Mac Alt changes e.key
        const m = /^(Key([A-Z])|Digit([0-9]))$/.exec(e.code || '')
        const letter = m ? (m[2] || m[3]).toLowerCase() : ''
        if (!letter) return
        if (!document.querySelector('.mateu-access-keys')) show()
        const hit = current.find((c) => c.letter === letter)
        if (hit) {
            e.preventDefault()
            e.stopPropagation()
            hide()
            hit.el.click()
        }
    }, true)
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Alt') {
            if (hold) { clearTimeout(hold); hold = undefined }
            hide()
        }
    }, true)
    window.addEventListener('blur', hide)
}
