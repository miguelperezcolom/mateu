import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import { safeHtml } from "./safeHtml";
import { renderBadgeMetadata } from "@infra/ui/renderers/badgeRenderer.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { badge } from "@infra/ui/badgeStyles.ts";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import type ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata.ts";
import type Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";
import type Component from "@mateu/shared/apiClients/dtos/Component.ts";

import { interpolate, possiblyHtml } from './interpolation'
import { isBackButton, isNavButton } from './toolbarButtonKinds'
import { navigateToRoute } from './rowRoute'
import { shellTrail, pathOfPage, Crumb, navigateLikeMenu, onShellMenuChange } from './breadcrumbTrail'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { linkStyles } from "@infra/ui/linkStyles.ts";
import { safeNavigate } from '@infra/ui/safeNavigate.ts'
import { chromeText } from '@infra/ui/chromeTexts.ts'

export { possiblyHtml } from './interpolation'

export const buttonTheme = (button: Button): string | undefined => {
    const parts: string[] = []
    if (button.color && button.color !== 'normal' && button.color !== 'none') parts.push(button.color)
    if (button.buttonStyle) parts.push(button.buttonStyle === 'tertiaryInline' ? 'tertiary-inline' : button.buttonStyle)
    if (button.size && button.size !== 'none' && button.size !== 'normal') parts.push(button.size)
    return parts.length ? parts.join(' ') : undefined
}

/** Maps a Button's theme to DS-neutral CSS classes for the native fallback button. */
export const neutralButtonClass = (button: Button): string => {
    const t = buttonTheme(button) ?? ''
    const c: string[] = []
    if (t.includes('primary')) c.push('primary')
    if (t.includes('tertiary')) c.push('tertiary')
    if (t.includes('error') || button.color === 'error') c.push('danger')
    return c.join(' ')
}

// Re-exported so the existing import site keeps working; the predicates themselves live in a
// module of their own now that the crud shares them. See toolbarButtonKinds.
export { isNavButton, isBackButton, isCancelButton } from './toolbarButtonKinds'

@customElement('mateu-content-header')
export class MateuContentHeader extends LitElement {

    @property()
    metadata?: ComponentMetadata

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

    // "…" overflow for secondary actions: primaries stay inline; secondaries stay inline as long
    // as they FIT — only the ones that don't fit collapse into this menu (measured, not a count).
    @state()
    private _overflowOpen = false

    // How many trailing secondary buttons are moved into the "…" menu (measured to fit the header).
    @state()
    private _overflowN = 0
    private _secCount = 0
    private _ro?: ResizeObserver

    private _onDocClick = (e: Event) => {
        if (!e.composedPath().includes(this)) {
            this._overflowOpen = false
        }
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('click', this._onDocClick)
        // Re-fit the toolbar whenever the header (or window) is resized. The ResizeObserver catches
        // container-driven size changes; the window listener is a robust fallback.
        this._ro = new ResizeObserver(() => this._resetOverflow())
        this._ro.observe(this)
        window.addEventListener('resize', this._resetOverflow)
        // The automatic trail reads the shell's menu, which grows when the remote sections answer:
        // a header drawn on a cold load (the section alone) is drawn again with the whole trail.
        this._offShellMenu = onShellMenuChange(() => this.requestUpdate())
    }

    private _offShellMenu: (() => void) | undefined

    disconnectedCallback() {
        this._offShellMenu?.()
        this._offShellMenu = undefined
        document.removeEventListener('click', this._onDocClick)
        window.removeEventListener('resize', this._resetOverflow)
        this._ro?.disconnect()
        this._ro = undefined
        super.disconnectedCallback()
    }

    /** Show everything inline again, then let updated() shrink to fit — the expand path on resize. */
    private _resetOverflow = () => {
        if (this._overflowN !== 0) this._overflowN = 0
        else this.requestUpdate()
    }

    /** After each render, move one more secondary into the "…" menu while the action cluster still
     *  overflows the header (wrapped to a new line or past the right edge). Monotonic → converges. */
    protected updated(changed: Map<PropertyKey, unknown>) {
        if (changed.has('_overflowOpen') && this._overflowOpen) this._placeOverflowMenu()
        if (changed.has('metadata') || changed.has('data')) { this._resetOverflow(); return }
        // Inside a dialog the header is as wide as its content, and moving a button into the menu
        // narrows the dialog, which "overflows" again: every secondary ended in "…". There the
        // actions wrap instead of collapsing.
        if (this._inDialog()) { if (this._overflowN !== 0) this._overflowN = 0; return }
        const cluster = this.renderRoot.querySelector('.actions-cluster') as HTMLElement | null
        if (!cluster || this._secCount === 0) return
        const row = cluster.closest('.form-header, .no-header-row') as HTMLElement | null
        if (!row) return
        const cr = cluster.getBoundingClientRect()
        const rr = row.getBoundingClientRect()
        const overflowing = cr.top - rr.top > 8 || cr.right > rr.right + 1
        if (overflowing && this._overflowN < this._secCount) this._overflowN += 1
    }

    /** Whether this header is drawn inside a dialog (crossing shadow roots on the way up). */
    private _inDialog(): boolean {
        let node: any = this
        while (node) {
            const tag = node.tagName
            if (tag === 'VAADIN-DIALOG-OVERLAY' || tag === 'DIALOG' || node.getAttribute?.('role') === 'dialog') return true
            node = node.parentElement ?? (node.getRootNode?.() as ShadowRoot | undefined)?.host
        }
        return false
    }

    /** The "…" menu opens toward the side it fits: anchored right by default, flipped to the left
     *  edge when that would take it past the viewport's left border. */
    private _placeOverflowMenu() {
        const menu = this.renderRoot.querySelector('.overflow-menu') as HTMLElement | null
        if (!menu) return
        menu.classList.remove('flip')
        if (menu.getBoundingClientRect().left < 0) menu.classList.add('flip')
    }

    handleButtonClick = (button: Button) => {
        this._overflowOpen = false
        // A header button (a back chevron, a "New") carrying a route NAVIGATES on the client instead
        // of running a server action — so a pure-DSL page reaches its sibling screens with no view
        // model behind it. The `${state.x}` template is resolved against the page state.
        const route = button.route ? interpolate(button.route, this.state, this.data) : undefined
        if (route && !route.includes('${')) {
            navigateToRoute(this, route)
            return
        }
        // A ROUTED listing renders its toolbar HERE (not in the crud), so a "Delete selected" acts on
        // rows the sibling <mateu-table-crud> tracks in its own state. Carry that selection with the
        // action — the enclosing mateu-component's rowsSelectedRequired gate, a bulk restAction and
        // the componentState sent to the server all read it. Absent a listing, this is an empty array
        // and changes nothing.
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: button.actionId, parameters: { crud_selected_items: this.listingSelection() } },
            bubbles: true,
            composed: true
        }))
    }

    /** The row selection of the listing this header belongs to (its sibling crud), or []. */
    private listingSelection = (): unknown[] => {
        const crud = this.findSiblingCrud()
        const sel = (crud as any)?.state?.['crud_selected_items']
        return Array.isArray(sel) ? sel : []
    }

    /** Climb to the ancestor that also holds the listing, then find the crud (piercing shadow). */
    private findSiblingCrud = (): Element | null => {
        const deepQuery = (root: Document | ShadowRoot | Element): Element | null => {
            for (const el of Array.from(root.querySelectorAll('*'))) {
                if (el.tagName === 'MATEU-TABLE-CRUD') return el
                if ((el as any).shadowRoot) {
                    const hit = deepQuery((el as any).shadowRoot)
                    if (hit) return hit
                }
            }
            return null
        }
        let node: Node | null = this
        while (node) {
            const el = node as any
            const container: Element | null =
                el.parentElement ?? (el.getRootNode?.() instanceof ShadowRoot ? (el.getRootNode() as ShadowRoot).host : null)
            if (!container) break
            const hit = deepQuery(container)
            if (hit) return hit
            node = container
        }
        return null
    }

    evalLabel = (raw: string) => interpolate(raw, this.state, this.data)

    /**
     * The way back, as a chevron before the title.
     *
     * <p>Its label is not dropped, it moves to the accessible name: a screen reader still hears
     * "Back to list", and so does a hover. A glyph with no name is a button nobody can identify.
     */
    renderBackChevron = (button: Button) => {
        if ((this.data ?? {})[button.actionId + '.hidden']) return nothing
        const label = this.evalLabel(button.label)
        return html`
        <button class="back-chevron"
                data-action-id="${button.id}"
                title="${label}"
                aria-label="${label}"
                @click="${() => this.handleButtonClick(button)}">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>`
    }

    renderBtn = (button: Button) => {
        if ((this.data ?? {})[button.actionId + '.hidden']) return nothing
        const label = this.evalLabel(button.label)
        // Renderers with their own design system provide the button through
        // the renderToolbarButton hook; the Vaadin default stays here.
        const custom = componentRenderer.get()?.renderToolbarButton?.(
            button, label, () => this.handleButtonClick(button))
        if (custom) {
            return custom
        }
        // DS-neutral default button (the Vaadin adapter provides a vaadin-button via the
        // renderToolbarButton hook; icons are the adapter's job).
        return html`
        <button class="mtb ${neutralButtonClass(button)}"
                data-action-id="${button.id}"
                @click="${() => this.handleButtonClick(button)}"
                ?disabled="${button.disabled}"
        >${label}</button>
    `
    }

    // Action cluster with the "…" overflow: primaries always inline; secondaries stay inline while
    // they FIT the header and only the trailing ones that don't fit collapse into the menu. The
    // split (_overflowN) is measured in updated(); here we just render it.
    renderActions = (actionButtons: Button[]) => {
        const visible = actionButtons.filter(b => !(this.data ?? {})[b.actionId + '.hidden'])
        const primaries = visible.filter(b => b.buttonStyle === 'primary')
        const secondaries = visible.filter(b => b.buttonStyle !== 'primary')
        this._secCount = secondaries.length
        const n = Math.max(0, Math.min(this._overflowN, secondaries.length))
        const inline = secondaries.slice(0, secondaries.length - n)
        const menu = secondaries.slice(secondaries.length - n)
        return html`
            <div class="actions-cluster">
                ${primaries.map(this.renderBtn)}
                ${inline.map(this.renderBtn)}
                ${menu.length ? html`
                    <div class="overflow-wrap">
                        <button class="mtb overflow-btn" title="${chromeText('moreActions')}" aria-label="${chromeText('moreActions')}" aria-haspopup="true"
                                aria-expanded="${this._overflowOpen}"
                                @click="${(e: Event) => { e.stopPropagation(); this._overflowOpen = !this._overflowOpen }}">⋯</button>
                        ${this._overflowOpen ? html`
                            <div class="overflow-menu">
                                ${menu.map(b => html`
                                    <button class="overflow-item" ?disabled="${b.disabled}"
                                            data-action-id="${b.actionId}"
                                            @click="${() => this.handleButtonClick(b)}">${this.evalLabel(b.label)}</button>
                                `)}
                            </div>
                        ` : nothing}
                    </div>
                ` : nothing}
            </div>
        `
    }

    // Previous/next peer-object arrows (the Redwood "next/previous object" header element).
    // Navigates like a breadcrumb link; a missing route disables that side.
    renderPeerNav = (peerNav: NonNullable<Form['peerNav']>) => {
        const custom = componentRenderer.get()?.renderPeerNav?.(peerNav)
        if (custom) return custom
        return html`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <button class="mtb tertiary peer-nav-prev"
                        title="${peerNav.prevLabel ?? chromeText('previous')}"
                        aria-label="${peerNav.prevLabel ?? chromeText('previous')}"
                        ?disabled="${!peerNav.prevRoute}"
                        @click="${() => { if (peerNav.prevRoute) safeNavigate(peerNav.prevRoute) }}">‹</button>
                <button class="mtb tertiary peer-nav-next"
                        title="${peerNav.nextLabel ?? chromeText('next')}"
                        aria-label="${peerNav.nextLabel ?? chromeText('next')}"
                        ?disabled="${!peerNav.nextRoute}"
                        @click="${() => { if (peerNav.nextRoute) safeNavigate(peerNav.nextRoute) }}">›</button>
            </div>
        `
    }

    /**
     * The trail above the title: the page's own (`@Breadcrumbs` / `BreadcrumbsSupplier`) when it
     * declares one, else the automatic one (breadcrumbTrail) — only on a top-level page, and not when
     * the page or the shell says `@NoBreadcrumbs`.
     */
    private crumbsOf(metadata: Form, level: number): Crumb[] {
        if (metadata?.breadcrumbs && metadata.breadcrumbs.length > 0) {
            return metadata.breadcrumbs.map(b => ({ text: b.text, route: b.link || undefined }))
        }
        if (level > 0 || metadata?.type !== ComponentMetadataType.Page || metadata.noBreadcrumbs) return []
        return shellTrail(pathOfPage(metadata), { title: metadata.title, pageType: metadata.pageType })
    }

    /** Inside the app for a path (the menu's own navigation), a full load for anything else. */
    private goToCrumb(route: string) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(route)) {
            // an absolute URL (any scheme): followed only when it is http(s) — never javascript:
            safeNavigate(route)
            return
        }
        if (!dirtyGuard.confirmLeave()) return
        // like a menu click: the shell reloads the content for that route
        if (navigateLikeMenu(route)) return
        navigateToRoute(this, route)
    }

    render(): TemplateResult {
        const metadata = this.metadata as Form | undefined
        if (!metadata) return html``
        const peerNav = metadata.peerNav && (metadata.peerNav.prevRoute || metadata.peerNav.nextRoute)
            ? metadata.peerNav : undefined

        const toolbar: Button[] = metadata.toolbar ?? []
        // Back reads as a chevron before the title — but only where there IS a title to put it
        // before. A header rendering no title (noHeader) keeps it as an ordinary button, because a
        // lone glyph floating in a toolbar names nothing.
        const backAsChevron = !metadata.noHeader
        const navButtons = toolbar.filter((b: Button) =>
            isNavButton(b.actionId) && !(backAsChevron && isBackButton(b.actionId)))
        const backButtons = backAsChevron
            ? toolbar.filter((b: Button) => isBackButton(b.actionId))
            : []
        const actionButtons = toolbar.filter((b: Button) => !isNavButton(b.actionId))
        const divider = navButtons.length > 0 && actionButtons.length > 0
            ? html`<span class="toolbar-divider"></span>`
            : nothing
        // Redwood header text elements. `titlePlaceholder` is a PLACEHOLDER, not a default: it only
        // stands in while there is no title, and never overrides one.
        const overline = (metadata as any).overline as string | undefined
        const titlePlaceholder = metadata.title
            ? undefined
            : ((metadata as any).titlePlaceholder as string | undefined)
        const hasMainHeader = metadata.avatar || metadata.title || metadata.subtitle
            || overline || titlePlaceholder
            || (metadata.kpis?.length > 0) || (metadata.header?.length > 0) || toolbar.length > 0
            || !!peerNav
        const level = metadata.level ?? 0
        // The `data-nested` attribute drives the :host([data-nested]) CSS rule that drops the
        // top padding so an embedded (level>0) header sits flush with its host card.
        if (level > 0) this.setAttribute('data-nested', '')
        else this.removeAttribute('data-nested')

        const crumbs = this.crumbsOf(metadata as Form, level)
        return html`
            ${crumbs.length > 0 ? html`
                <nav class="breadcrumbs-bar" aria-label="${chromeText('breadcrumb')}">
                    ${crumbs.map((crumb, index: number) => html`
                        ${index > 0 ? html`<span class="breadcrumb-sep" aria-hidden="true">›</span>` : nothing}
                        ${crumb.route
                            ? html`<button class="breadcrumb-link" @click="${() => this.goToCrumb(crumb.route!)}">${crumb.text}</button>`
                            : html`<span class="${index === crumbs.length - 1 ? 'breadcrumb-current' : 'breadcrumb-group'}"
                                        aria-current="${index === crumbs.length - 1 ? 'page' : nothing}">${crumb.text}</span>`}
                    `)}
                </nav>
            ` : nothing}
            ${metadata.noHeader ? html`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;" class="no-header-row">
                    ${metadata?.header?.map((component: Component) => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
                    ${peerNav ? this.renderPeerNav(peerNav) : nothing}
                    ${navButtons.map(this.renderBtn)}
                    ${divider}
                    ${this.renderActions(actionButtons)}
                </div>
            ` : hasMainHeader ? html`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center; flex-wrap: wrap;" class="form-header">
                    ${backButtons.map(this.renderBackChevron)}
                    ${metadata.avatar ? renderComponent(this, metadata.avatar, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData) : nothing}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${overline ? html`<div class="page-overline">${safeHtml(possiblyHtml(overline, this.state ?? {}, this.data ?? {}))}</div>` : nothing}
                        ${(metadata?.title || titlePlaceholder) && level == 0?html`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${metadata?.title
                                    ? safeHtml(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))
                                    : html`<span class="page-title-placeholder">${safeHtml(possiblyHtml(titlePlaceholder!, this.state ?? {}, this.data ?? {}))}</span>`}</h2>
                                ${(metadata as any).kpisBelow && metadata.badges?.length
                                    ? metadata.badges.map((b) => renderBadgeMetadata(b, this.state ?? {}, this.data ?? {}, { pill: true }))
                                    : nothing}
                            </div>`:nothing}
                        ${metadata?.title && level == 1?html`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${safeHtml(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h3>`:nothing}
                        ${metadata?.title && level == 2?html`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${safeHtml(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h4>`:nothing}
                        ${metadata?.title && level == 3?html`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${safeHtml(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h5>`:nothing}
                        ${metadata?.title && level > 3?html`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${safeHtml(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h6>`:nothing}

                        ${metadata?.subtitle ? html`<span style="display: inline-block; margin-block-end: 0.83em;">${safeHtml(possiblyHtml(metadata?.subtitle, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                        ${metadata?.timestamp ? html`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${safeHtml(possiblyHtml(metadata.timestamp, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${!(metadata as any).kpisBelow ? metadata?.kpis?.map((kpi) => html`
                            <div class="header-fact">
                                <span class="header-fact-label">${this.evalLabel(kpi.title)}</span>
                                <span class="header-fact-value">${safeHtml(possiblyHtml(kpi.text, this.state ?? {}, this.data ?? {}))}</span>
                            </div>
                        `) : nothing}
                        ${metadata?.header?.map((component: Component) => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
                        ${peerNav ? this.renderPeerNav(peerNav) : nothing}
                        ${navButtons.map(this.renderBtn)}
                        ${divider}
                        ${this.renderActions(actionButtons)}
                    </div>
                </div>
            ` : nothing}
            ${(metadata as any).kpisBelow && metadata?.kpis?.length ? html`
                <div class="kpi-row">
                    ${metadata.kpis.map((kpi) => html`
                        <div class="kpi-pair">
                            <span class="kpi-label">${this.evalLabel(kpi.title)}</span>
                            <span class="kpi-value">${safeHtml(possiblyHtml(kpi.text, this.state ?? {}, this.data ?? {}))}</span>
                        </div>
                    `)}
                </div>
            ` : nothing}
            ${metadata.badges && metadata.badges.length > 0 && !(metadata as any).kpisBelow ? html`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${metadata.badges.map((b) => renderBadgeMetadata(b, this.state ?? {}, this.data ?? {}, { pill: true }))}
                </div>
            ` : nothing}
        `
    }

    static styles = [css`
        :host {
            display: block;
            width: 100%;
            padding-top: var(--lumo-space-m);
        }

        /* When rendered nested (e.g. inside an @Inline embedded mediator, level>0) the host
           section/card already provides top spacing, so suppress this header's own padding-top. */
        :host([data-nested]) {
            padding-top: 0;
        }

        /* The way back: a chevron sitting before the title, at its optical size rather than a
           button's. Quiet until pointed at, like the affordance it imitates — a detail view's back
           arrow is furniture, not an action competing with Save. */
        .back-chevron {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: 2rem;
            height: 2rem;
            padding: 0;
            margin-inline-start: -0.35rem;
            border: none;
            border-radius: 50%;
            background: transparent;
            color: var(--lumo-secondary-text-color, #5a6270);
            cursor: pointer;
        }
        .back-chevron svg { width: 1.25rem; height: 1.25rem; }
        .back-chevron:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); color: inherit; }
        .back-chevron:focus-visible { outline: 2px solid var(--lumo-primary-color, #2563eb); outline-offset: 2px; }

        /* Redwood overline: the small line above the title — a category or parent context.
           Quieter and smaller than the title, with the same ellipsis discipline. */
        .page-overline {
            color: var(--lumo-secondary-text-color, #6b7280);
            font-size: var(--lumo-font-size-s, .875rem);
            line-height: 1.2;
            margin-block-end: .15rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Redwood pageTitlePlaceholder: stands in for a title that does not exist yet (create
           mode). Rendered inside the title heading so it keeps its size, but muted so it never
           reads as a real title. */
        .page-title-placeholder {
            color: var(--lumo-tertiary-text-color, #9ca3af);
            font-weight: inherit;
        }

        .breadcrumbs-bar {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--lumo-space-xs, .25rem) var(--lumo-space-s, .5rem);
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #6b7280);
            padding-bottom: var(--lumo-space-xs, .25rem);
        }
        .breadcrumb-sep { color: var(--lumo-tertiary-text-color, #9ca3af); }
        .breadcrumb-current { color: var(--lumo-body-text-color, inherit); }

        .breadcrumb-link {
            border: none;
            background: transparent;
            cursor: pointer;
            font: inherit;
            color: var(--lumo-primary-text-color, #1676f3);
            padding: 0;
        }

        /* Facts row UNDER the title (hoisted EntityHeader anatomy): label+value pairs,
           label in small caps secondary, value emphasized — mirrors the VB/Redwood header. */
        /* @KPI in the header: the EntityHeader fact look (small-caps muted label over a bold
           value), like the front office stay's TOTAL RESERVA / AGENCIA */
        .header-fact {
            display: flex; flex-direction: column; gap: .1rem; min-width: 0;
            padding-inline-end: var(--lumo-space-s, .5rem);
        }
        .header-fact-label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
            white-space: nowrap;
        }
        .header-fact-value {
            font-size: var(--lumo-font-size-m, 1rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; line-height: normal;
        }
        .kpi-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--lumo-space-s, .5rem) 2.5rem;
            align-items: baseline;
            padding: var(--lumo-space-xs, .25rem) 0 var(--lumo-space-s, .5rem);
        }
        .kpi-pair {
            display: flex;
            gap: var(--lumo-space-s, .5rem);
            align-items: baseline;
        }
        .kpi-label {
            font-size: var(--lumo-font-size-xs, .8125rem);
            letter-spacing: .03em;
            text-transform: uppercase;
            color: var(--lumo-secondary-text-color, #6b7280);
        }
        .kpi-value {
            font-weight: 600;
        }

        /* The action cluster stays on one line and moves/wraps as a unit; updated() measures it
           against the header row to decide how many trailing secondaries overflow into the menu. */
        .actions-cluster {
            display: inline-flex;
            align-items: center;
            flex-wrap: nowrap;
            gap: var(--lumo-space-xs, .25rem);
        }

        /* "…" overflow menu for secondary header actions */
        .overflow-wrap {
            position: relative;
            display: inline-block;
        }
        .overflow-btn {
            font-weight: 700;
            line-height: 1;
        }
        .overflow-menu {
            position: absolute;
            right: 0;
            top: calc(100% + .25rem);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, .15));
            border-radius: var(--lumo-border-radius-m, 6px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, .18));
            padding: .25rem;
            min-width: 13rem;
            display: flex;
            flex-direction: column;
            z-index: 30;
        }
        .overflow-menu.flip {
            right: auto;
            left: 0;
        }
        .overflow-item {
            text-align: left;
            border: none;
            background: transparent;
            font: inherit;
            padding: .5rem .75rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
            white-space: nowrap;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .overflow-item:hover:not(:disabled) {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, .04));
        }
        .overflow-item:disabled {
            opacity: .5;
            cursor: default;
        }

        .toolbar-divider {
            display: inline-block;
            width: 1px;
            height: 1.5rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }

        /* DS-neutral toolbar button (the Vaadin adapter overrides via renderToolbarButton) */
        .mtb {
            font: inherit; font-weight: 500;
            padding: .4rem .9rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0,0,0,.25));
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            cursor: pointer;
        }
        .mtb:hover:not(:disabled) { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        .mtb:disabled { opacity: .5; cursor: default; }
        .mtb.primary { background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); border-color: transparent; }
        .mtb.tertiary { background: transparent; border-color: transparent; color: var(--lumo-primary-text-color, #1676f3); }
        .mtb.danger { color: var(--lumo-error-text-color, #c0392b); border-color: var(--lumo-error-color-50pct, rgba(192,57,43,.5)); }
        .mtb.danger.primary { background: var(--lumo-error-color, #c0392b); color: #fff; border-color: transparent; }

        ${badge}
    `, linkStyles]
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-content-header': MateuContentHeader
    }
}
