import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/card'
import '@vaadin/button'
import '@vaadin/icon'
import '@vaadin/icons'
import '@vaadin/master-detail-layout'
import { customElement, property, state } from 'lit/decorators.js';
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import './mateu-content-header'
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
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('page-banners-received', this._bannersHandler)
        window.removeEventListener('resize', this._onResize)
        this._clearAllTimers()
        this._teardownScrollSpy()
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
        if (!text?.includes('${')) return text
        return new Function('state', 'data', 'return `' + text + '`')(this.state ?? {}, this.data ?? {})
    }

    private _renderBanner(banner: Banner, onDismiss: () => void): TemplateResult {
        const title = this._evalBannerText(banner.title)
        const description = this._evalBannerText(banner.description)
        return html`
            <vaadin-card class="page-banner page-banner--${this.bannerThemeClass(banner)}">
                ${title ? html`
                    <div slot="title" style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span>${title}</span>
                        ${banner.hasCloseButton ? html`
                            <vaadin-button theme="icon tertiary small" class="banner-close" @click=${onDismiss} title="Dismiss">
                                <vaadin-icon icon="vaadin:close"></vaadin-icon>
                            </vaadin-button>
                        ` : nothing}
                    </div>
                ` : banner.hasCloseButton ? html`
                    <vaadin-button slot="title" theme="icon tertiary small" class="banner-close" style="margin-left: auto;" @click=${onDismiss} title="Dismiss">
                        <vaadin-icon icon="vaadin:close"></vaadin-icon>
                    </vaadin-button>
                ` : nothing}
                ${description ? html`<p>${description}</p>` : nothing}
            </vaadin-card>
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

    /** Section cards live inside the slotted <vaadin-vertical-layout> as ordinary light-DOM descendants. */
    private _sectionCards(): HTMLElement[] {
        return Array.from(this.querySelectorAll('vaadin-card.mateu-section')) as HTMLElement[]
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
        this._onScrollSpy()
    }

    private _teardownScrollSpy() {
        this._spyTarget?.removeEventListener('scroll', this._onScrollSpy)
        this._spyTarget = undefined
    }

    // Classic scrollspy: the active entry is the last section whose top has crossed the activation
    // line near the top of the scroll viewport. Sticky (pinned) sections are skipped so a pinned card
    // never permanently hijacks the highlight.
    private _onScrollSpy = () => {
        const cards = this._tocEntries.map(e => e.el)
        if (!cards.length) return
        const root = this._scrollContainer()
        const rootTop = root ? root.getBoundingClientRect().top : 0
        const gap = 12
        // Activation line sits just below the currently-pinned region (the header plus any sticky
        // section pinned at the top), matching where clicked sections land, so the active entry
        // agrees with click-to-scroll.
        let pinnedBottom = rootTop + this._headerH
        for (const c of this._sectionCards()) {
            if (!c.classList.contains('mateu-section--sticky')) continue
            const pinTop = rootTop + parseFloat(c.style.top || '0')
            if (c.getBoundingClientRect().top <= pinTop + 1) {
                pinnedBottom = Math.max(pinnedBottom, c.getBoundingClientRect().bottom)
            }
        }
        const line = pinnedBottom + gap + 4
        let active = 0
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].classList.contains('mateu-section--sticky')) continue
            if (cards[i].getBoundingClientRect().top <= line) active = i
        }
        this._activeToc = active
    }

    private _scrollToSection(i: number) {
        const entry = this._tocEntries[i]
        if (!entry) return
        this._activeToc = i
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
            <mateu-content-header
                class="${this._tocVisible ? 'sticky-header' : ''}"
                .metadata="${metadata}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${banners.length > 0 ? html`
                <div class="page-banners">
                    ${banners.map(({ banner, onDismiss }) => this._renderBanner(banner, onDismiss))}
                </div>
            ` : nothing}
            <div class="page-body ${this._tocVisible ? 'with-toc' : ''}">
                <div class="form-content">
                    <slot @slotchange=${this._onSlotChange}></slot>
                    <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                        <slot name="buttons"></slot>
                    </vaadin-horizontal-layout>
                </div>
                ${this._tocVisible ? html`
                    <aside class="page-toc">
                        <nav>
                            ${this._tocEntries.map((entry, i) => html`
                                <a class="page-toc__item ${i === this._activeToc ? 'is-active' : ''}"
                                   @click=${() => this._scrollToSection(i)}
                                   title=${entry.title}>${entry.title}</a>
                            `)}
                        </nav>
                    </aside>
                ` : nothing}
            </div>
            <div class="form-footer">
                ${metadata?.footer?.map(component => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
            </div>
        `
        return (false && this.standalone)
            ? html`<vaadin-card style="width: 100%;">${inner}</vaadin-card>`
            : html`<vaadin-vertical-layout style="width: 100%;">${inner}</vaadin-vertical-layout>`
    }

    static styles = css`
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
            display: block;
            padding: 0.2rem 0.5rem;
            cursor: pointer;
            color: var(--lumo-secondary-text-color);
            border-left: 2px solid transparent;
            margin-left: -0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-radius: var(--lumo-border-radius-s);
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
            color: #1a1a1a;
        }

        .page-banner p {
            margin: 0;
            color: #1a1a1a;
        }

        .banner-close {
            color: #1a1a1a;
            flex-shrink: 0;
        }

        .page-banner--info {
            --vaadin-card-background: #e8f4fd;
            border-leftx: 4px solid var(--lumo-primary-color);
        }

        .page-banner--success {
            --vaadin-card-background: #eafaf1;
            border-leftx: 4px solid var(--lumo-success-color);
        }

        .page-banner--warning {
            --vaadin-card-background: #fef9e7;
            border-leftx: 4px solid var(--lumo-warning-color, #f59e0b);
        }

        .page-banner--danger {
            --vaadin-card-background: #fdf2f2;
            border-leftx: 4px solid var(--lumo-error-color);
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}
