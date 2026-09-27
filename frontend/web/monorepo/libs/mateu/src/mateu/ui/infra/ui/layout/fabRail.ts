import { css, nothing, unsafeCSS } from "lit";
import type { ElementPart } from "lit";
import { AsyncDirective, directive, PartType } from "lit/async-directive.js";
import type { PartInfo } from "lit/async-directive.js";
import type { ResolvedPageWidth } from "@infra/ui/layout/pageWidth.ts";

/**
 * The floating action buttons' rail, and the aside channel it lives in: where every FAB of a shell
 * sits, what it looks like, and the room the work area leaves for it.
 *
 * <p>The look is a Lumo button, not a Material disc: a square of `--lumo-size-l` with Lumo's medium
 * radius and the primary colour.
 *
 * <p>Where it sits follows the page width, as in the Redwood shell (oj-sp-simple-ui-shell keeps a
 * channel to the right of the content for its floating chrome — a fixed-width page's content ends
 * where that channel starts — and puts the chrome against the page's edge on an edge-to-edge page):
 * <ul>
 *     <li><b>edge-to-edge</b>: flush in the viewport's bottom-right corner, inside the content — the
 *     page has no margin to put it in.</li>
 *     <li><b>fixed and full width</b>: in a channel just right of the work area, at the bottom,
 *     OUTSIDE it. A fixed-width page is narrowed (symmetrically) when its margin is too thin for the
 *     channel; a full-width page reserves the channel as its end padding. Nothing of the work area
 *     is ever under a FAB.</li>
 *     <li><b>narrow</b> viewports (a phone): the corner, over the content — a channel would eat a
 *     sixth of the screen.</li>
 * </ul>
 * The same channel holds the page's section index (a form's table of contents) when there is one,
 * sticky at the top — then the channel is as wide as the index needs, and the FABs sit under it.
 *
 * <p>Who reserves: the content view (`trackFabAnchor`) — the outermost view a shell renders as its
 * content. It publishes the FABs' anchor as custom properties on the document root
 * (`--mateu-fab-inset-end`, `--mateu-fab-inset-bottom`) — custom properties inherit through shadow
 * roots, so every FAB, in whichever shadow tree it is rendered, reads the same value.
 *
 * <p>Who is on the rail: each FAB registers itself (`onFabRail`), so the content view knows whether
 * there is anything to leave room for, and page FABs stack above the shell's in the same column
 * (`--mateu-fab-shell-slots`).
 *
 * <p>The agent's chat is not on the rail: its toggle is a header widget (appRenderer), so it neither
 * takes a slot nor makes the content view reserve a channel.
 */

const SIZE = 'var(--mateu-fab-size, var(--lumo-size-l, 2.75rem))'
const GAP = 'var(--mateu-fab-gap, var(--lumo-space-s, 0.5rem))'
/** Distance from the bottom edge. */
const INSET = 'var(--mateu-fab-inset-bottom, var(--mateu-fab-inset-block, var(--lumo-space-m, 1rem)))'

/** The end inset every FAB reads: published on the document root, the corner until then. */
export const FAB_INSET_END = 'var(--mateu-fab-inset-end, var(--lumo-space-m, 1rem))'

/** Below this viewport width there is no channel: the FABs go to the corner, the index to a bar. */
export const NARROW_VIEWPORT = 600
/** The index goes to the channel only from this viewport width on: below it a 15rem channel leaves too little page. */
export const TOC_ASIDE_VIEWPORT = 1200

/** Sizes in rem (Lumo's): the corner inset, a FAB, the gap to the work area, the index and its gap. */
const REM = { inset: 1, size: 2.75, gap: 0.5, toc: 15, tocGap: 2 }

/** `bottom` of the FAB in the given slot of the shell's column (0 = the lowest). */
export const fabBottom = (slot: number): string => `calc(${INSET} + ${slot} * (${SIZE} + ${GAP}))`

/** `bottom` of a page FAB: same column, above every FAB of the shell. */
export const pageFabBottom = (index: number): string =>
    `calc(${INSET} + (var(--mateu-fab-shell-slots, 0) + ${index}) * (${SIZE} + ${GAP}))`

/** Inline position of a shell FAB: its slot in the column. The look comes from `fabStyles`. */
export const fabPosition = (slot: number): string => `bottom: ${fabBottom(slot)}; right: ${FAB_INSET_END};`

/** Inline position of a page FAB: stacked above the shell's. */
export const pageFabPosition = (index: number): string => `bottom: ${pageFabBottom(index)}; right: ${FAB_INSET_END};`

/**
 * The look of a FAB (the class goes on a plain <button>, so the core stays free of any design
 * system's elements): Lumo's primary button, square, with a small lift so it reads as floating.
 */
export const fabStyles = (selector: string) => css`
    ${unsafeSelector(selector)} {
        position: fixed;
        box-sizing: border-box;
        width: ${unsafe(SIZE)};
        height: ${unsafe(SIZE)};
        padding: 0;
        border: none;
        border-radius: var(--lumo-border-radius-m, 0.25rem);
        background-color: var(--lumo-primary-color, #1676f3);
        color: var(--lumo-primary-contrast-color, #fff);
        box-shadow: var(--lumo-box-shadow-s, 0 2px 4px rgba(0, 0, 0, 0.2));
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--lumo-icon-size-m, 1.5rem);
        z-index: 900;
        transition: background-color 0.15s, bottom 0.2s ease, right 0.2s ease;
    }
    ${unsafeSelector(selector)}:hover {
        background-image: linear-gradient(var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)), var(--lumo-tint-10pct, rgba(255, 255, 255, 0.1)));
    }
    ${unsafeSelector(selector)}:active {
        background-image: linear-gradient(var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)), var(--lumo-shade-10pct, rgba(0, 0, 0, 0.1)));
    }
    ${unsafeSelector(selector)}:focus-visible {
        outline: none;
        box-shadow: 0 0 0 2px var(--lumo-base-color, #fff), 0 0 0 4px var(--lumo-primary-color-50pct, rgba(22, 118, 243, 0.5));
    }
`

// ---- who is on the rail ---------------------------------------------------------------------

/** shell: the app's column; page: stacked above it. */
type FabKind = 'shell' | 'page'
type FabEntry = { kind: FabKind, slot: number }

/** Where a page's section index goes: the channel, a bar over the form, or its own column. */
export type AsidePlacement = 'aside' | 'bar' | 'column'

const fabs = new Map<Element, FabEntry>()
const asides = new Map<Element, (placement: AsidePlacement, workEnd?: number) => void>()
const railListeners = new Set<() => void>()
let notifyScheduled = false

const rootRem = () => parseFloat(getComputedStyle(document.documentElement).fontSize || '16') || 16

/** Publishes how high the column goes, from who is on the rail. */
const publishSlots = () => {
    const root = document.documentElement.style
    const entries = [...fabs.values()]
    const shellSlots = entries.filter(f => f.kind === 'shell').reduce((max, f) => Math.max(max, f.slot + 1), 0)
    const pageFabs = entries.filter(f => f.kind === 'page').length
    root.setProperty('--mateu-fab-shell-slots', String(shellSlots))
    root.setProperty('--mateu-fab-slots', String(shellSlots + pageFabs))
}

const railChanged = () => {
    if (notifyScheduled) return
    notifyScheduled = true
    queueMicrotask(() => {
        notifyScheduled = false
        publishSlots()
        railListeners.forEach(listener => listener())
    })
}

const addFab = (element: Element, entry: FabEntry) => {
    const current = fabs.get(element)
    if (current?.kind === entry.kind && current.slot === entry.slot) return
    fabs.set(element, entry)
    railChanged()
}

const removeFab = (element: Element) => {
    if (fabs.delete(element)) railChanged()
}

/** How many FABs are on the rail. */
export const fabCount = (): number => fabs.size

class OnFabRail extends AsyncDirective {
    private element?: Element
    private entry?: FabEntry

    constructor(partInfo: PartInfo) {
        super(partInfo)
        if (partInfo.type !== PartType.ELEMENT) throw new Error('onFabRail goes on the FAB element')
    }

    render(_kind: FabKind, _slot?: number) {
        return nothing
    }

    update(part: ElementPart, [kind, slot]: [FabKind, number?]) {
        if (this.element && this.element !== part.element) removeFab(this.element)
        this.element = part.element
        this.entry = { kind, slot: slot ?? 0 }
        if (this.isConnected) addFab(this.element, this.entry)
        return nothing
    }

    protected disconnected() {
        if (this.element) removeFab(this.element)
    }

    protected reconnected() {
        if (this.element && this.entry) addFab(this.element, this.entry)
    }
}

/**
 * Puts a FAB on the rail: `<button class="app-fab" ${onFabRail('shell', slot)}>`. A shell FAB
 * declares its slot, so page FABs know how high the shell's stack goes; a page FAB stacks above it.
 */
export const onFabRail = directive(OnFabRail)

/**
 * Asks for the page's section index to go to the aside channel. `onPlacement` is told where it
 * goes — the channel, or a bar over the form where there is none (edge-to-edge, narrow) — and,
 * for the channel, where the work area ends (px from the viewport's start: the channel starts
 * there, whatever the page's own width inside the work area), now and whenever the layout is
 * republished. Until a content view takes it, and with no content view, it keeps its own column.
 * The returned function withdraws the request.
 */
export const requestAside = (element: Element, onPlacement: (placement: AsidePlacement, workEnd?: number) => void): (() => void) => {
    asides.set(element, onPlacement)
    onPlacement(currentTocPlacement, currentWorkEnd)
    railChanged()
    return () => {
        if (asides.delete(element)) railChanged()
    }
}

let currentTocPlacement: AsidePlacement = 'column'
let currentWorkEnd: number | undefined

const placeAsides = (placement: AsidePlacement, workEnd?: number) => {
    currentTocPlacement = placement
    currentWorkEnd = workEnd
    asides.forEach(onPlacement => onPlacement(placement, workEnd))
}

// ---- the channel ----------------------------------------------------------------------------

/** What the channel holds, and the room each thing needs, in px. */
export interface ChannelInput {
    mode: ResolvedPageWidth
    viewportWidth: number
    /** The content view's end edge (its border box), from the viewport's start. */
    contentEnd: number
    /** The end edge of the room the view is centred in (its end edge plus its end margin). Fixed only. */
    containerEnd?: number
    hasFabs: boolean
    hasToc: boolean
    rem: number
}

export interface ChannelLayout {
    /** Width reserved at the viewport's end edge for the channel (0: none). */
    channel: number
    /** Where the index goes. */
    toc: AsidePlacement
    /** The FABs' distance from the viewport's end and bottom edges (bottom undefined: the default). */
    insetEnd: number
    insetBottom?: number
    /** Full width: the end padding the view needs so its content stops where the channel starts. */
    padEnd?: number
    /** Fixed width: how much narrower than its container the view must be on each side for the
     *  channel to fit past its end edge (what the container's own margin to the viewport lacks). */
    squeeze?: number
}

/**
 * The layout of the channel for a content view. Pure, so it is testable; `trackFabAnchor` feeds
 * it the view's live measurements.
 *
 * <ul>
 *     <li>edge-to-edge: no channel, FABs flush in the corner, the index in a bar;</li>
 *     <li>narrow: no channel, FABs in the corner with the usual inset, the index in a bar;</li>
 *     <li>fixed / full: a channel of `inset + FAB + gap` (or `inset + index + its gap` when the
 *     index goes there); a fixed view's FABs start one gap past its end edge, a full view's sit at
 *     the corner inset, its padding keeping its content one gap short of them.</li>
 * </ul>
 */
export const channelLayout = (input: ChannelInput): ChannelLayout => {
    const { mode, viewportWidth, contentEnd, hasFabs, hasToc, rem } = input
    const inset = REM.inset * rem
    const fabSpan = (REM.size + REM.gap) * rem
    if (mode === 'edge') return { channel: 0, toc: 'bar', insetEnd: 0, insetBottom: 0 }
    if (viewportWidth < NARROW_VIEWPORT) return { channel: 0, toc: 'bar', insetEnd: inset }
    const tocAside = hasToc && viewportWidth >= TOC_ASIDE_VIEWPORT
    const channel = Math.max(
        hasFabs ? inset + fabSpan : 0,
        tocAside ? inset + (REM.toc + REM.tocGap) * rem : 0,
    )
    const toc: AsidePlacement = tocAside ? 'aside' : 'bar'
    if (mode === 'full') {
        // The view's border box does not move with its padding: pad it so its content ends where
        // the channel starts, never below the 24px gutter a full-width view always has.
        const padEnd = channel > 0 ? Math.max(24, Math.round(channel - (viewportWidth - contentEnd))) : undefined
        return { channel, toc, insetEnd: inset, padEnd }
    }
    // fixed: the view is narrowed, both sides alike, only as much as its margin lacks for the
    // channel (see mateu-ux, data-aside); the FABs end where the channel's content does — one gap
    // past the view's end edge, or under the index's end edge when the index widens the channel.
    const squeeze = channel > 0 ? Math.max(0, Math.round(channel - (viewportWidth - (input.containerEnd ?? contentEnd)))) : undefined
    const span = Math.max(fabSpan, channel - inset)
    return { channel, toc, insetEnd: Math.max(inset, Math.round(viewportWidth - contentEnd - span)), squeeze }
}

// ---- the content view that owns the channel -------------------------------------------------

type Candidate = { element: HTMLElement, mode: ResolvedPageWidth, order: number }
const candidates = new Map<HTMLElement, Candidate>()
let order = 0
let owner: HTMLElement | undefined
let observer: ResizeObserver | undefined

/** Whether `ancestor` contains `node`, across shadow roots. */
const containsDeep = (ancestor: Node, node: Node): boolean => {
    let current: Node | null = node
    while (current) {
        current = current.parentNode ?? (current as ShadowRoot).host ?? null
        if (current === ancestor) return true
    }
    return false
}

/** The outermost connected candidate; among several, the last to register. */
const chooseOwner = (): HTMLElement | undefined => {
    const live = [...candidates.values()].filter(c => c.element.isConnected)
    const outermost = live.filter(c => !live.some(other => other !== c && containsDeep(other.element, c.element)))
    return outermost.sort((a, b) => b.order - a.order)[0]?.element
}

const clearView = (element: HTMLElement) => {
    element.removeAttribute('data-aside')
    element.style.removeProperty('--mateu-aside-squeeze')
    element.style.removeProperty('--mateu-aside-pad-end')
}

const publish = () => {
    const root = document.documentElement
    const next = chooseOwner()
    if (owner && owner !== next) {
        observer?.unobserve(owner)
        clearView(owner)
    }
    if (next && next !== owner) observer?.observe(next)
    owner = next
    if (!owner) {
        root.style.removeProperty('--mateu-fab-inset-end')
        root.style.removeProperty('--mateu-fab-inset-bottom')
        publishSlots()
        placeAsides('column')
        return
    }
    const candidate = candidates.get(owner)!
    const rem = rootRem()
    const viewportWidth = root.clientWidth || window.innerWidth
    const contentEnd = owner.getBoundingClientRect().right
    const layout = channelLayout({
        mode: candidate.mode,
        viewportWidth,
        contentEnd,
        containerEnd: contentEnd + (parseFloat(getComputedStyle(owner).marginRight) || 0),
        hasFabs: fabs.size > 0,
        hasToc: asides.size > 0,
        rem,
    })
    if (layout.channel > 0) {
        owner.setAttribute('data-aside', '')
        owner.style.setProperty('--mateu-aside-squeeze', `${layout.squeeze ?? 0}px`)
        if (layout.padEnd !== undefined) owner.style.setProperty('--mateu-aside-pad-end', `${layout.padEnd}px`)
        else owner.style.removeProperty('--mateu-aside-pad-end')
    } else {
        clearView(owner)
    }
    root.style.setProperty('--mateu-fab-inset-end', `${layout.insetEnd}px`)
    publishSlots()
    if (layout.insetBottom !== undefined) root.style.setProperty('--mateu-fab-inset-bottom', `${layout.insetBottom}px`)
    else root.style.removeProperty('--mateu-fab-inset-bottom')
    placeAsides(layout.toc, contentEnd - (parseFloat(getComputedStyle(owner).paddingRight) || 0))
}

let listening = false
const listen = () => {
    if (listening) return
    listening = true
    observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => publish()) : undefined
    window.addEventListener('resize', publish)
    railListeners.add(publish)
}
const unlisten = () => {
    if (!listening) return
    listening = false
    observer?.disconnect()
    observer = undefined
    window.removeEventListener('resize', publish)
    railListeners.delete(publish)
}

/**
 * Registers a content view of the given width mode: the outermost one owns the channel — it
 * reserves the room and publishes the FABs' anchor, and keeps both in step as it, the viewport or
 * the rail change. The returned function lets it go (the next view takes over, or the corner).
 */
export const trackFabAnchor = (element: HTMLElement, mode: ResolvedPageWidth): (() => void) => {
    candidates.set(element, { element, mode, order: ++order })
    listen()
    publish()
    return () => {
        if (candidates.get(element)?.element !== element) return
        candidates.delete(element)
        clearView(element)
        publish()
        if (candidates.size === 0) unlisten()
    }
}

// css`` only interpolates CSSResults; the selector and the size are trusted constants of this file.
const unsafe = (value: string) => unsafeCSS(value)
const unsafeSelector = (selector: string) => unsafeCSS(selector)
