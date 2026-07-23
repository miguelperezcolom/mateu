import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from 'lit/decorators.js';
import FoldoutPanelInfo from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutPanelInfo";
import FoldoutNavigation from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutNavigation";

/**
 * Vaadin-specific foldout: a horizontal CAROUSEL of always-expanded, borderless, full-height
 * sections (unlike the shared {@link import('@infra/ui/mateu-foldout').MateuFoldout}, which
 * collapses panels to vertical strips).
 *
 * - Every section (the overview + each panel) is fully visible and runs top to bottom; when they
 *   don't all fit, the row scrolls left/right like a carousel, SNAPPING each column flush to the
 *   left edge (scroll-snap) instead of scrolling continuously.
 * - The title, toolbar (object navigation) and badges live INSIDE the first section (the overview
 *   column) — there is no shared full-width header band.
 * - The first section is PINNED to the left edge while you scroll (native `position: sticky`), so
 *   it doesn't disappear on the first scroll; only once the scroll passes the overview's own width
 *   does it slide out smoothly and travel with the rest. Scrolling back re-pins it. Implemented with
 *   a `translateX(min(0, width - scrollLeft))` applied on top of the sticky pin — 0 while pinned,
 *   negative (sliding out) past the threshold, so there is no jump at the release point.
 *
 * Content arrives through light-DOM slots exactly like the shared component: slot="overview" and
 * slot="panel-N".
 */
@customElement('mateu-vaadin-foldout')
export class MateuVaadinFoldout extends LitElement {

    @property({ type: Array })
    panels: FoldoutPanelInfo[] = []

    @property({ type: String })
    headerTitle = ''

    @property({ type: Array })
    badges: string[] = []

    @property({ attribute: false })
    navigation: FoldoutNavigation | null = null

    // actionId dispatched by the overview's Edit affordance ('' = no Edit button)
    @property({ type: String })
    overviewEditActionId = ''

    @query('.rail') private _rail?: HTMLElement
    @query('.section--first') private _first?: HTMLElement

    private _raf = 0
    private _snapping = false

    // Whether the carousel can still scroll left / right (drive the bottom-corner nav affordances).
    @state()
    private _less = false
    @state()
    private _more = false

    private navAction(actionId?: string) {
        if (!actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: {} },
            bubbles: true,
            composed: true
        }))
    }

    private _onScroll = () => {
        if (!this._raf) {
            this._raf = requestAnimationFrame(() => {
                this._raf = 0
                this._syncPin()
            })
        }
    }

    // Carousel snapping is done in JS (not CSS scroll-snap, which fights the pin transform on the
    // first section): when free scrolling ends, glide to the nearest section boundary.
    private _onScrollEnd = () => {
        if (!this._snapping) {
            this._snapToNearest()
        }
    }

    private _stride() {
        const sections = this.renderRoot.querySelectorAll<HTMLElement>('.section')
        return sections.length > 1 ? sections[1].offsetLeft : (this._rail?.clientWidth ?? 0)
    }

    private _snapToNearest() {
        const rail = this._rail
        if (!rail) {
            return
        }
        const stride = this._stride()
        if (stride <= 0) {
            return
        }
        const max = rail.scrollWidth - rail.clientWidth
        const target = Math.max(0, Math.min(Math.round(rail.scrollLeft / stride) * stride, max))
        if (Math.abs(target - rail.scrollLeft) < 1) {
            return
        }
        this._snapping = true
        rail.scrollTo({ left: target, behavior: 'smooth' })
        window.setTimeout(() => { this._snapping = false }, 400)
    }

    // Pins the first section to the left edge for exactly ONE carousel step: it counter-translates
    // the scroll (translateX == scrollLeft → stays visually at left:0) up to the stride — the offset
    // of the SECOND section, i.e. one snap step. So the first step keeps section 1 fully pinned
    // (with section 2 hidden behind it), and from the second step on the translate is capped at the
    // stride, letting section 1 slide out and travel with the rest. Scrolling back re-pins it.
    // Done with a plain transform (NOT position: sticky, which fights scroll-snap on the same box).
    private _syncPin() {
        const rail = this._rail
        const first = this._first
        if (!rail || !first) {
            return
        }
        const stride = this._stride()
        const pin = Math.min(rail.scrollLeft, stride)
        first.style.transform = pin ? `translateX(${pin}px)` : ''
        first.classList.toggle('floating', rail.scrollLeft > 0)
        const max = rail.scrollWidth - rail.clientWidth
        const scrollable = max > 2
        this._less = scrollable && rail.scrollLeft > 2
        this._more = scrollable && rail.scrollLeft < max - 2
    }

    // Fills the column height down to the viewport bottom regardless of any chrome above the foldout
    // (the foldout page has no definite-height ancestor to inherit from), so no gap is left below.
    private _fit = () => {
        const top = this.getBoundingClientRect().top
        this.style.setProperty('--mateu-foldout-fill', `${Math.max(240, window.innerHeight - top)}px`)
        this._syncPin()
    }

    // Left/Right arrows step the carousel one section — captured at the DOCUMENT level so it works
    // whether or not the rail itself is focused (a foldout page owns the arrow keys). It stands down
    // when the user is typing in a field or a modifier is held (e.g. Alt+Left = browser back), and
    // stepping it explicitly is also what lets ArrowLeft walk all the way back to scrollLeft 0.
    private _onKeydown = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') {
            return
        }
        if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || this._isEditingContext()) {
            return
        }
        const rail = this._rail
        if (!rail || rail.scrollWidth <= rail.clientWidth) {
            return
        }
        e.preventDefault()
        this._step(e.key === 'ArrowRight' ? 1 : -1)
    }

    // Glide the carousel one section left (-1) or right (+1), clamped to the ends.
    private _step(dir: number) {
        const rail = this._rail
        if (!rail) {
            return
        }
        const stride = this._stride()
        if (stride <= 0) {
            return
        }
        const index = Math.round(rail.scrollLeft / stride)
        const max = rail.scrollWidth - rail.clientWidth
        const target = Math.max(0, Math.min((index + dir) * stride, max))
        this._snapping = true
        rail.scrollTo({ left: target, behavior: 'smooth' })
        window.setTimeout(() => { this._snapping = false }, 400)
    }

    // True when focus is in a control that needs the arrow keys itself, so the carousel keeps its
    // hands off. Pierces shadow roots (Vaadin fields wrap a native <input> in a shadow DOM).
    private _isEditingContext(): boolean {
        let el: Element | null = document.activeElement
        while (el && el.shadowRoot && el.shadowRoot.activeElement) {
            el = el.shadowRoot.activeElement
        }
        if (!el) {
            return false
        }
        const tag = el.tagName
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
            || (el as HTMLElement).isContentEditable
    }

    protected firstUpdated() {
        this._fit()
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('keydown', this._onKeydown)
        window.addEventListener('resize', this._fit)
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._onKeydown)
        window.removeEventListener('resize', this._fit)
        if (this._raf) {
            cancelAnimationFrame(this._raf)
            this._raf = 0
        }
        super.disconnectedCallback()
    }

    static styles = css`
        :host {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            box-sizing: border-box;
            min-height: var(--mateu-foldout-min-height, 30rem);
            height: var(--mateu-foldout-fill, var(--mateu-foldout-height, calc(100dvh - 8rem)));
            margin: var(--mateu-foldout-outer-margin, 0);
        }
        /* The carousel row: full-height borderless columns; snaps each column flush to the left. */
        .rail {
            display: flex;
            flex: 1;
            min-height: var(--mateu-foldout-fill, var(--mateu-foldout-min-height, calc(100dvh - 8rem)));
            gap: var(--mateu-foldout-gap, var(--lumo-space-l, 1.5rem));
            align-items: stretch;
            overflow-x: auto;
            overflow-y: hidden;
            padding: var(--mateu-foldout-rail-padding, 0);
            outline: none;
        }
        .rail:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #1976d2);
            outline-offset: -2px;
        }
        .section {
            position: relative;
            flex: 0 0 var(--mateu-foldout-section-width, 22rem);
            min-width: 0;
            background: var(--mateu-foldout-panel-bg, transparent);
            border: none;
            border-radius: 0;
            padding: var(--mateu-foldout-panel-padding, var(--lumo-space-m, 1rem));
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            overflow-y: auto;
        }
        /* The overview: pinned to the left edge for one carousel step via a transform (see _syncPin).
           While floating over the scrolled content it needs an opaque background (so the sliding
           columns pass cleanly behind it) + its own stacking context + a drop shadow; at rest it
           stays borderless/flush. NOT position: sticky — that fights scroll-snap on the same box. */
        .section--first {
            position: relative;
            z-index: 2;
            flex-basis: var(--mateu-foldout-overview-width, 22rem);
            will-change: transform;
        }
        .section--first.floating {
            background: var(--mateu-foldout-panel-bg, var(--lumo-base-color, #fff));
            box-shadow: var(--mateu-foldout-pinned-shadow, 6px 0 12px -6px rgba(0, 0, 0, .25));
        }
        /* Title + toolbar + badges — these live INSIDE the first section, not in a full-width band. */
        .section-head {
            display: flex;
            flex-direction: column;
            gap: .5rem;
        }
        .section-head-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: .75rem;
        }
        .section-title {
            margin: 0;
            font-size: var(--mateu-foldout-header-title-size, var(--lumo-font-size-xl, 1.375rem));
            font-weight: var(--mateu-foldout-header-title-weight, 700);
            color: var(--lumo-header-text-color, inherit);
            line-height: 1.2;
        }
        .section-toolbar {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            flex: 0 0 auto;
        }
        .section-toolbar .tb-parent,
        .section-toolbar .tb-edit {
            display: inline-flex;
            align-items: center;
            gap: .3rem;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .16));
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-text-color, #1976d2);
            cursor: pointer;
            font: inherit;
            font-weight: 600;
            font-size: var(--lumo-font-size-s, .875rem);
            padding: .2rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .section-toolbar .tb-move {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.9rem;
            height: 1.9rem;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .16));
            background: var(--lumo-base-color, #fff);
            border-radius: var(--lumo-border-radius-m, 6px);
            cursor: pointer;
            color: var(--lumo-body-text-color, inherit);
            font-size: 1rem;
            line-height: 1;
        }
        .section-toolbar button:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .section-badges {
            display: flex;
            flex-wrap: wrap;
            gap: .5rem;
        }
        .section-badge {
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, .2));
            border-radius: 999px;
            padding: .1rem .625rem;
            font-size: var(--lumo-font-size-s, .8rem);
            color: var(--lumo-secondary-text-color, inherit);
            white-space: nowrap;
        }
        .overview-body {
            flex: 1;
            min-height: 0;
        }
        .panel-header h3 {
            margin: 0;
            font-size: var(--mateu-foldout-title-size, var(--lumo-font-size-l, 1.125rem));
            font-weight: var(--mateu-foldout-title-weight, 600);
        }
        .panel-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .panel-body {
            flex: 1;
            min-height: 0;
        }
        /* Carousel affordances: floating round buttons at the bottom corners, each shown only while
           the carousel can still scroll that way (the left one hides at the start, the right one at
           the end). Clicking steps one section that direction. */
        .scroll-nav {
            position: absolute;
            bottom: var(--mateu-foldout-nav-bottom, 1.25rem);
            z-index: 3;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 50%;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, .08));
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-text-color, #1976d2);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, .18);
            transition: opacity .2s ease, transform .2s ease;
        }
        .scroll-nav.right {
            right: var(--mateu-foldout-nav-right, 1.25rem);
        }
        .scroll-nav.left {
            left: var(--mateu-foldout-nav-left, 1.25rem);
        }
        .scroll-nav:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .scroll-nav.right:hover {
            transform: translateX(2px);
        }
        .scroll-nav.left:hover {
            transform: translateX(-2px);
        }
        .scroll-nav svg {
            width: 1.35rem;
            height: 1.35rem;
        }
    `

    render() {
        const nav = this.navigation
        const hasToolbar = !!(this.overviewEditActionId
            || (nav && (nav.parentActionId || nav.previousActionId || nav.nextActionId)))
        const hasHead = !!(this.headerTitle || hasToolbar || this.badges.length)
        return html`
            <div class="rail" part="rail" tabindex="0"
                 @scroll="${this._onScroll}" @scrollend="${this._onScrollEnd}">
                <section class="section section--first" part="section overview">
                    ${hasHead ? html`
                        <header class="section-head" part="section-head">
                            <div class="section-head-row">
                                ${this.headerTitle
                                    ? html`<h2 class="section-title">${this.headerTitle}</h2>`
                                    : html`<span></span>`}
                                ${hasToolbar ? html`
                                    <div class="section-toolbar" part="section-toolbar">
                                        ${nav?.parentActionId ? html`
                                            <button class="tb-parent" title="${nav.parentLabel ?? 'Back'}"
                                                    @click="${() => this.navAction(nav.parentActionId)}">
                                                <span>‹</span><span>${nav.parentLabel ?? 'Back'}</span>
                                            </button>
                                        ` : nothing}
                                        ${nav?.previousActionId ? html`
                                            <button class="tb-move" title="Previous"
                                                    @click="${() => this.navAction(nav.previousActionId)}">‹</button>
                                        ` : nothing}
                                        ${nav?.nextActionId ? html`
                                            <button class="tb-move" title="Next"
                                                    @click="${() => this.navAction(nav.nextActionId)}">›</button>
                                        ` : nothing}
                                        ${this.overviewEditActionId ? html`
                                            <button class="tb-edit" title="Edit"
                                                    @click="${() => this.navAction(this.overviewEditActionId)}">
                                                <span>✎</span><span>Edit</span>
                                            </button>
                                        ` : nothing}
                                    </div>
                                ` : nothing}
                            </div>
                            ${this.badges.length ? html`
                                <div class="section-badges">
                                    ${this.badges.map(b => html`<span class="section-badge">${b}</span>`)}
                                </div>
                            ` : nothing}
                        </header>
                    ` : nothing}
                    <div class="overview-body">
                        <slot name="overview"></slot>
                    </div>
                </section>
                ${this.panels.map((panel, index) => html`
                    <section class="section" part="section panel">
                        ${panel.title || panel.subtitle ? html`
                            <div class="panel-header">
                                ${panel.title ? html`<h3>${panel.title}</h3>` : nothing}
                                ${panel.subtitle ? html`<div class="subtitle">${panel.subtitle}</div>` : nothing}
                            </div>
                        ` : nothing}
                        <div class="panel-body">
                            <slot name="panel-${index}"></slot>
                        </div>
                    </section>
                `)}
            </div>
            ${this._less ? html`
                <button class="scroll-nav left" part="scroll-nav-left" title="Scroll left"
                        aria-label="Scroll left" @click="${() => this._step(-1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 6 9 12 15 18"></polyline>
                    </svg>
                </button>
            ` : nothing}
            ${this._more ? html`
                <button class="scroll-nav right" part="scroll-nav-right" title="Scroll right"
                        aria-label="Scroll right" @click="${() => this._step(1)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            ` : nothing}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-vaadin-foldout": MateuVaadinFoldout
    }
}
