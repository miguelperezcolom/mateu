import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import './mateu-content-header'
import { interpolate } from './interpolation'
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner.ts"

/** Next ancestor element, crossing shadow-DOM boundaries via the host, for scroll-container lookup. */
function nextAncestor(el: HTMLElement): HTMLElement | null {
    if (el.parentElement) return el.parentElement
    const root = el.getRootNode()
    return root instanceof ShadowRoot ? (root.host as HTMLElement) : null
}

@customElement('mateu-page')
export class MateuPage extends LitElement {

    @property()
    component?: ClientSideComponent

    @property()
    baseUrl?: string

    @property()
    state?: ComponentState

    @property()
    data?: ComponentData

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

    @property()
    value?: unknown

    @property({ type: Boolean })
    standalone = false

    @state()
    actionBanners: Banner[] = []

    @state()
    dismissedStaticBannerIndices: Set<number> = new Set()

    // Sticky sections index (table of contents). See the @Toc annotation (backend).
    @state()
    private _tocEntries: { title: string, el: HTMLElement }[] = []

    @state()
    private _activeToc = 0

    @state()
    private _tocVisible = false

    private _spyTarget?: HTMLElement | Window
    private _tocRebuildScheduled = false
    private _headerH = 0
    private _onResize = () => this._layoutStickyTops()
    // While locked (right after clicking an index entry) the scrollspy leaves the active entry alone,
    // so a clicked section stays highlighted even if it sits near the bottom and can't scroll all the
    // way up to the reading line. Any manual scroll gesture releases the lock.
    private _tocLocked = false
    private _unlockToc = (e?: Event) => {
        // The Ctrl+Alt+<n> index shortcut is itself a keydown that *locks* (it's a jump, like a
        // click), so don't let it immediately release the lock.
        if (e && e.type === 'keydown') {
            const ke = e as KeyboardEvent
            if (ke.ctrlKey && ke.altKey && !ke.shiftKey && !ke.metaKey && /^(?:Digit|Numpad)[1-9]$/.test(ke.code)) return
        }
        this._tocLocked = false
    }

    private _actionBannerTimers: ReturnType<typeof setTimeout>[] = []
    private _staticBannerTimers: ReturnType<typeof setTimeout>[] = []

    private _bannersHandler = (e: Event) => {
        const detail = (e as CustomEvent).detail
        const newBanners: Banner[] = detail.banners ?? []
        const append: boolean = detail.append ?? false
        if (!append) {
            this._clearActionBannerTimers()
            this.actionBanners = newBanners
        } else {
            this.actionBanners = [...this.actionBanners, ...newBanners]
        }
        const baseIndex = append ? this.actionBanners.length - newBanners.length : 0
        newBanners.forEach((banner, i) => {
            if (banner.timeoutSeconds && banner.timeoutSeconds > 0) {
                const targetIndex = baseIndex + i
                this._actionBannerTimers.push(setTimeout(() => {
                    this.actionBanners = this.actionBanners.filter((_, idx) => idx !== targetIndex)
                }, banner.timeoutSeconds * 1000))
            }
        })
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('page-banners-received', this._bannersHandler)
        window.addEventListener('resize', this._onResize)
        document.addEventListener('keydown', this._onTocKey)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('page-banners-received', this._bannersHandler)
        window.removeEventListener('resize', this._onResize)
        document.removeEventListener('keydown', this._onTocKey)
        this._clearAllTimers()
        this._teardownScrollSpy()
    }

    // When the index is shown, Ctrl+Alt+<1..9> jumps to the matching section (same as clicking the
    // index entry). Matches both the top-row digits (Digit1..9) and the numeric keypad (Numpad1..9)
    // via e.code, so it works regardless of keyboard layout and NumLock state.
    private _onTocKey = (e: KeyboardEvent) => {
        if (!this._tocVisible) return
        if (!e.ctrlKey || !e.altKey || e.shiftKey || e.metaKey) return
        const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)
        if (!m) return
        const idx = parseInt(m[1], 10) - 1
        if (idx >= this._tocEntries.length) return
        e.preventDefault()
        this._scrollToSection(idx)
    }

    updated(changedProperties: PropertyValues) {
        super.updated(changedProperties)
        if (changedProperties.has('component') && changedProperties.get('component') !== undefined) {
            this._clearAllTimers()
            this.actionBanners = []
            this.dismissedStaticBannerIndices = new Set()
        }
        if (changedProperties.has('component')) {
            this._scheduleStaticBannerTimeouts()
            this.dispatchEvent(new CustomEvent('compact-changed', {
                detail: { compact: !!this.component?.style?.includes('--mateu-compact:1') },
                bubbles: true,
                composed: true,
            }))
            // The sections (slotted light-DOM cards) are re-rendered on component change; rebuild the
            // index after the browser has laid them out (Vaadin cards populate their shadow async).
            this._scheduleTocRebuild()
        }
    }

    private _scheduleStaticBannerTimeouts() {
        this._staticBannerTimers.forEach(t => clearTimeout(t))
        this._staticBannerTimers = []
        const metadata = this.component?.metadata as PageComponent
        const staticBanners: Banner[] = (metadata as any)?.banners ?? []
        staticBanners.forEach((banner, i) => {
            if (banner.timeoutSeconds && banner.timeoutSeconds > 0) {
                this._staticBannerTimers.push(setTimeout(() => {
                    this.dismissedStaticBannerIndices = new Set([...this.dismissedStaticBannerIndices, i])
                }, banner.timeoutSeconds * 1000))
            }
        })
    }

    private _clearActionBannerTimers() {
        this._actionBannerTimers.forEach(t => clearTimeout(t))
        this._actionBannerTimers = []
    }

    private _clearAllTimers() {
        this._clearActionBannerTimers()
        this._staticBannerTimers.forEach(t => clearTimeout(t))
        this._staticBannerTimers = []
    }

    private _dismissActionBanner(index: number) {
        this.actionBanners = this.actionBanners.filter((_, i) => i !== index)
    }

    private _dismissStaticBanner(index: number) {
        this.dismissedStaticBannerIndices = new Set([...this.dismissedStaticBannerIndices, index])
    }

    bannerThemeClass(banner: Banner): string {
        const t = banner.theme?.toLowerCase() ?? 'info'
        return t === 'none' ? '' : t
    }

    private _evalBannerText(text: string | undefined): string | undefined {
        return interpolate(text, this.state, this.data)
    }

    private _renderBanner(banner: Banner, onDismiss: () => void): TemplateResult {
        const title = this._evalBannerText(banner.title)
        const description = this._evalBannerText(banner.description)
        // Neutral markup (was a vaadin-card): the banner strip renders on EVERY design system.
        return html`
            <div class="page-banner page-banner--${this.bannerThemeClass(banner)}">
                ${title || banner.hasCloseButton ? html`
                    <div style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span style="font-weight: 600;">${title ?? ''}</span>
                        ${banner.hasCloseButton ? html`
                            <button class="banner-close" @click=${onDismiss} title="Dismiss" aria-label="Dismiss">✕</button>
                        ` : nothing}
                    </div>
                ` : nothing}
                ${description ? html`<p>${description}</p>` : nothing}
            </div>
        `
    }

    // ── Sticky sections index (table of contents) ─────────────────────────────

    private _onSlotChange() {
        this._scheduleTocRebuild()
    }

    private _scheduleTocRebuild() {
        if (this._tocRebuildScheduled) return
        this._tocRebuildScheduled = true
        // Vaadin cards upgrade/populate their shadow after slotting; enumerate on the next frame.
        requestAnimationFrame(() => {
            this._tocRebuildScheduled = false
            this._rebuildToc()
        })
    }

    /** Section cards are slotted light-DOM descendants carrying the mateu-section marker class (any design system). */
    private _sectionCards(): HTMLElement[] {
        return Array.from(this.querySelectorAll('.mateu-section')) as HTMLElement[]
    }

    private _sectionTitle(card: HTMLElement): string | undefined {
        const fromSlot = card.querySelector('[slot="title"]')?.textContent?.trim()
        if (fromSlot) return fromSlot
        // The reflective @Section path renders the title as a heading inside the card content.
        return card.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || undefined
    }

    private _rebuildToc() {
        const cards = this._sectionCards()
        const entries = cards
            .map(el => ({ title: this._sectionTitle(el), el }))
            .filter((e): e is { title: string, el: HTMLElement } => !!e.title)

        const toc = (this.component?.metadata as PageComponent)?.toc
        // Auto heuristic: enough sections stacked vertically and not a @Zones/@FoldedLayout (horizontal) form.
        const auto = entries.length > 4 && cards.every(c => !c.closest('vaadin-horizontal-layout'))
        const visible = (toc === true ? true : toc === false ? false : auto) && entries.length > 0

        this._tocEntries = entries
        this._tocVisible = visible
        if (this._activeToc >= entries.length) this._activeToc = 0

        this._teardownScrollSpy()
        if (visible) {
            // Attach the scrollspy and compute the stacked sticky offsets after the with-toc grid
            // has been applied.
            requestAnimationFrame(() => {
                this._layoutStickyTops()
                this._setupScrollSpy()
            })
        } else {
            this._layoutStickyTops()
        }
    }

    /**
     * Pins the page header (in docs mode) and stacks every sticky section directly under it, so
     * multiple pinned elements never overlap. Each sticky card's `top` is the header height plus the
     * total height of the sticky cards declared before it.
     */
    private _layoutStickyTops() {
        const header = this.shadowRoot?.querySelector('mateu-content-header') as HTMLElement | null
        this._headerH = (this._tocVisible && header) ? header.offsetHeight : 0
        this.style.setProperty('--mateu-header-h', this._headerH + 'px')
        const gap = 12
        let offset = this._headerH + gap
        for (const card of this._sectionCards()) {
            if (!card.classList.contains('mateu-section--sticky')) continue
            card.style.top = offset + 'px'
            // Leave a gap below each pinned card so stacked sticky sections don't touch.
            offset += card.offsetHeight + gap
        }
    }

    private _scrollContainer(): HTMLElement | null {
        let node: HTMLElement | null = nextAncestor(this as HTMLElement)
        while (node) {
            const oy = getComputedStyle(node).overflowY
            if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
                return node
            }
            node = nextAncestor(node)
        }
        return null
    }

    private _setupScrollSpy() {
        if (!this._tocEntries.length) return
        this._spyTarget = this._scrollContainer() ?? window
        this._spyTarget.addEventListener('scroll', this._onScrollSpy, { passive: true })
        // A manual scroll gesture releases the click lock (see _tocLocked).
        window.addEventListener('wheel', this._unlockToc, { passive: true })
        window.addEventListener('touchstart', this._unlockToc, { passive: true })
        window.addEventListener('keydown', this._unlockToc)
        this._onScrollSpy()
    }

    private _teardownScrollSpy() {
        this._spyTarget?.removeEventListener('scroll', this._onScrollSpy)
        window.removeEventListener('wheel', this._unlockToc)
        window.removeEventListener('touchstart', this._unlockToc)
        window.removeEventListener('keydown', this._unlockToc)
        this._spyTarget = undefined
    }

    // Scrollspy: the active entry is the section that occupies the reading area — the strip just
    // below the pinned region (header + any pinned sticky sections). Sticky sections are *included*
    // so a pinned section (e.g. the guests list) is highlighted while it's the one in view and hands
    // off to the next as that scrolls up; sections hidden behind a pinned sticky are never marked
    // active because the reading line sits below the whole pinned region.
    private _onScrollSpy = () => {
        if (this._tocLocked) return
        const cards = this._sectionCards()
        if (!cards.length) return
        const gap = 12

        // Bottom of the pinned region: the pinned header, extended by each sticky section currently
        // butted up against it. Read straight from the rendered rects so it doesn't depend on the
        // sticky offsets having been computed yet.
        const header = this.shadowRoot?.querySelector('mateu-content-header') as HTMLElement | null
        let pinnedBottom = header ? header.getBoundingClientRect().bottom : 0
        for (const card of cards) {
            if (!card.classList.contains('mateu-section--sticky')) continue
            const r = card.getBoundingClientRect()
            // Allow for the gap left between the header and stacked sticky cards.
            if (r.top <= pinnedBottom + gap + 2) pinnedBottom = Math.max(pinnedBottom, r.bottom)
        }

        // +gap matches the gap that click-to-scroll leaves below the pinned region, so a clicked
        // section is highlighted as soon as it lands.
        const readingLine = pinnedBottom + gap + 4
        let active = 0
        this._tocEntries.forEach((entry, i) => {
            if (entry.el.getBoundingClientRect().top <= readingLine) active = i
        })
        this._activeToc = active
    }

    private _scrollToSection(i: number) {
        const entry = this._tocEntries[i]
        if (!entry) return
        this._activeToc = i
        // Keep this entry highlighted until the user scrolls, even if it can't reach the reading line
        // (e.g. a section near the bottom with too little content below it to scroll all the way up).
        this._tocLocked = true
        // Land the section at the start of the visible area, i.e. below the pinned header and any
        // sticky section that sits *above* this one (those overlap the top once pinned). Sticky
        // sections below the target don't overlap it, so they're not counted.
        const gap = 12
        let offset = this._headerH + gap
        for (const card of this._sectionCards()) {
            if (card === entry.el) break
            if (card.classList.contains('mateu-section--sticky')) offset += card.offsetHeight + gap
        }
        const root = this._scrollContainer()
        const rootTop = root ? root.getBoundingClientRect().top : 0
        const delta = entry.el.getBoundingClientRect().top - rootTop - offset
        ;(root ?? window).scrollBy({ top: delta, behavior: 'smooth' })
    }

    /** Design-system hook: a decorative band under the page header, invisible by default
     *  (height/image come from CSS custom properties, which pierce shadow DOM — e.g. the
     *  Redwood renderer sets them to the RDS color strip). Pages whose content is a crud skip
     *  it: their collection container carries the band (below the search bar) instead. Pages
     *  with a welcome banner (a HeroSection in the content) skip it too: in the Redwood anatomy
     *  the accent strip only shows on pages WITHOUT one. */
    private _showHeaderBand(): boolean {
        const metadata = this.component?.metadata as PageComponent
        const hasHeader = !!(metadata?.title || metadata?.subtitle || (metadata as any)?.toolbar?.length)
        const hasCrud = !!this.component?.children?.some(child =>
            (child as ClientSideComponent).metadata?.type === ComponentMetadataType.Crud)
        return hasHeader && !hasCrud && !this._hasWelcomeBanner()
    }

    /** Whether the page content carries a HeroSection (the welcome banner element). */
    private _hasWelcomeBanner(): boolean {
        const walk = (node: any): boolean => {
            if (node?.metadata?.type === ComponentMetadataType.HeroSection) return true
            return (node?.children ?? []).some(walk)
        }
        return (this.component?.children ?? []).some(walk)
    }

    render(): TemplateResult {
        const metadata = this.component?.metadata as PageComponent
        const allStaticBanners: Banner[] = (metadata as any)?.banners ?? []
        const visibleStaticBanners = allStaticBanners
            .map((b, i) => ({ banner: b, index: i }))
            .filter(({ index }) => !this.dismissedStaticBannerIndices.has(index))
        const banners = [
            ...visibleStaticBanners.map(({ banner, index }) => ({ banner, onDismiss: () => this._dismissStaticBanner(index) })),
            ...this.actionBanners.map((banner, i) => ({ banner, onDismiss: () => this._dismissActionBanner(i) }))
        ]
        const inner = html`
            <div class="page-header-wrap">
                <mateu-content-header
                    class="${this._tocVisible ? 'sticky-header' : ''}"
                    .metadata="${metadata}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                ${this._showHeaderBand() ? html`
                    <div class="page-header-band" aria-hidden="true"></div>
                ` : nothing}
            </div>
            ${banners.length > 0 ? html`
                <div class="page-banners">
                    ${banners.map(({ banner, onDismiss }) => this._renderBanner(banner, onDismiss))}
                </div>
            ` : nothing}
            <div class="page-body ${this._tocVisible ? 'with-toc' : ''}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem);" class="form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
                ${this._tocVisible ? html`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((entry, i) => html`
                                <a class="page-toc__item ${i === this._activeToc ? 'is-active' : ''}"
                                   @click=${() => this._scrollToSection(i)}
                                   title=${i < 9 ? `${entry.title} (Ctrl+Alt+${i + 1})` : entry.title}>
                                    <span class="page-toc__label">${entry.title}</span>
                                    ${i < 9 ? html`<span class="page-toc__key">${i + 1}</span>` : nothing}
                                </a>
                            `)}
                        </nav>
                    </aside>
                ` : nothing}
            </div>
            <div class="form-footer">
                ${metadata?.footer?.map(component => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
            </div>
        `
        return html`<div style="display: flex; flex-direction: column; width: 100%;">${inner}</div>`
    }

    static styles = css`
        /* Design-system hook: background behind the page header (the RDS "Header + Background"
           band) — transparent by default; the Redwood renderer paints it with the canvas color
           via a custom property, so the header reads as part of the canvas and the content slab
           starts at the color strip below. */
        .page-header-wrap {
            background: var(--mateu-page-header-bg, transparent);
        }

        .page-header-band {
            width: 100%;
            height: var(--mateu-page-band-h, 0);
            background-image: var(--mateu-page-band-image, none);
            background-repeat: repeat-x;
            background-size: auto var(--mateu-page-band-h, 0);
        }

        :host {
            width: 100%;
        }

        .form-content {
            width: 100%;
            min-width: 0;
        }

        .page-body {
            width: 100%;
        }

        .sticky-header {
            position: sticky;
            top: 0;
            z-index: 5;
            background: var(--lumo-base-color);
            padding-bottom: 0.25rem;
        }

        .page-body.with-toc {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 15rem;
            gap: 2rem;
            align-items: start;
        }

        .page-toc {
            position: sticky;
            top: calc(var(--mateu-header-h, 0px) + 0.5rem);
            align-self: start;
            max-height: calc(100vh - 8rem);
            overflow: auto;
            font-size: var(--lumo-font-size-s);
        }

        .page-toc nav {
            display: flex;
            flex-direction: column;
            gap: 0.1rem;
            border-left: 1px solid var(--lumo-contrast-10pct);
            padding-left: 0.25rem;
        }

        .page-toc__item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.2rem 0.5rem;
            cursor: pointer;
            color: var(--lumo-secondary-text-color);
            border-left: 2px solid transparent;
            margin-left: -0.25rem;
            border-radius: var(--lumo-border-radius-s);
        }

        .page-toc__label {
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .page-toc__key {
            flex-shrink: 0;
            font-size: var(--lumo-font-size-xxs);
            font-family: var(--lumo-font-family-monospace, monospace);
            color: var(--lumo-tertiary-text-color);
            background: var(--lumo-contrast-5pct);
            border-radius: var(--lumo-border-radius-s);
            padding: 0 0.3rem;
            line-height: 1.4;
            opacity: 0;
            transition: opacity 0.1s;
        }

        .page-toc:hover .page-toc__key,
        .page-toc__item.is-active .page-toc__key {
            opacity: 1;
        }

        .page-toc__item:hover {
            color: var(--lumo-body-text-color);
            background: var(--lumo-contrast-5pct);
        }

        .page-toc__item.is-active {
            color: var(--lumo-primary-text-color);
            border-left-color: var(--lumo-primary-color);
            font-weight: 600;
        }

        @media (max-width: 900px) {
            .page-body.with-toc {
                grid-template-columns: 1fr;
            }
            .page-toc {
                display: none;
            }
        }

        .page-banners {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 0 0.5rem;
            width: 100%;
            box-sizing: border-box;
        }

        .page-banner {
            width: 100%;
            box-sizing: border-box;
            color: #1a1a1a;
            padding: var(--lumo-space-m, 1rem);
            border-radius: var(--lumo-border-radius-l, 12px);
        }

        .page-banner p {
            margin: 0;
            color: #1a1a1a;
        }

        .banner-close {
            color: #1a1a1a;
            flex-shrink: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: .875rem;
            line-height: 1;
            padding: .25rem .4rem;
        }

        .page-banner--info {
            background: #e8f4fd;
            border-leftx: 4px solid var(--lumo-primary-color);
        }

        .page-banner--success {
            background: #eafaf1;
            border-leftx: 4px solid var(--lumo-success-color);
        }

        .page-banner--warning {
            background: #fef9e7;
            border-leftx: 4px solid var(--lumo-warning-color, #f59e0b);
        }

        .page-banner--danger {
            background: #fdf2f2;
            border-leftx: 4px solid var(--lumo-error-color);
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}
