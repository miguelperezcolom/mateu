import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
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

export const isNavButton = (id: string | undefined): boolean =>
    id === 'back' || id === 'backToList' || (!!id && id.startsWith('cancel'))

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
    }

    disconnectedCallback() {
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
        if (changed.has('metadata') || changed.has('data')) { this._resetOverflow(); return }
        const cluster = this.renderRoot.querySelector('.actions-cluster') as HTMLElement | null
        if (!cluster || this._secCount === 0) return
        const row = cluster.closest('.form-header, .no-header-row') as HTMLElement | null
        if (!row) return
        const cr = cluster.getBoundingClientRect()
        const rr = row.getBoundingClientRect()
        const overflowing = cr.top - rr.top > 8 || cr.right > rr.right + 1
        if (overflowing && this._overflowN < this._secCount) this._overflowN += 1
    }

    handleButtonClick = (actionId: string) => {
        this._overflowOpen = false
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId },
            bubbles: true,
            composed: true
        }))
    }

    evalLabel = (raw: string) => interpolate(raw, this.state, this.data)

    renderBtn = (button: Button) => {
        if ((this.data ?? {})[button.actionId + '.hidden']) return nothing
        const label = this.evalLabel(button.label)
        // Renderers with their own design system (Redwood, SLDS…) provide the button through
        // the renderToolbarButton hook; the Vaadin default stays here.
        const custom = componentRenderer.get()?.renderToolbarButton?.(
            button, label, () => this.handleButtonClick(button.actionId))
        if (custom) {
            return custom
        }
        // DS-neutral default button (the Vaadin adapter provides a vaadin-button via the
        // renderToolbarButton hook; icons are the adapter's job).
        return html`
        <button class="mtb ${neutralButtonClass(button)}"
                data-action-id="${button.id}"
                @click="${() => this.handleButtonClick(button.actionId)}"
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
                        <button class="mtb overflow-btn" title="Más acciones" aria-haspopup="true"
                                aria-expanded="${this._overflowOpen}"
                                @click="${(e: Event) => { e.stopPropagation(); this._overflowOpen = !this._overflowOpen }}">⋯</button>
                        ${this._overflowOpen ? html`
                            <div class="overflow-menu">
                                ${menu.map(b => html`
                                    <button class="overflow-item" ?disabled="${b.disabled}"
                                            data-action-id="${b.actionId}"
                                            @click="${() => this.handleButtonClick(b.actionId)}">${this.evalLabel(b.label)}</button>
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
                        title="${peerNav.prevLabel ?? 'Previous'}"
                        ?disabled="${!peerNav.prevRoute}"
                        @click="${() => { if (peerNav.prevRoute) window.location.href = peerNav.prevRoute }}">‹</button>
                <button class="mtb tertiary peer-nav-next"
                        title="${peerNav.nextLabel ?? 'Next'}"
                        ?disabled="${!peerNav.nextRoute}"
                        @click="${() => { if (peerNav.nextRoute) window.location.href = peerNav.nextRoute }}">›</button>
            </div>
        `
    }

    render(): TemplateResult {
        const metadata = this.metadata as Form | undefined
        if (!metadata) return html``
        const peerNav = metadata.peerNav && (metadata.peerNav.prevRoute || metadata.peerNav.nextRoute)
            ? metadata.peerNav : undefined

        const toolbar: Button[] = metadata.toolbar ?? []
        const navButtons = toolbar.filter((b: Button) => isNavButton(b.actionId))
        const actionButtons = toolbar.filter((b: Button) => !isNavButton(b.actionId))
        const divider = navButtons.length > 0 && actionButtons.length > 0
            ? html`<span class="toolbar-divider"></span>`
            : nothing
        const hasMainHeader = metadata.avatar || metadata.title || metadata.subtitle
            || (metadata.kpis?.length > 0) || (metadata.header?.length > 0) || toolbar.length > 0
            || !!peerNav
        const level = metadata.level ?? 0
        // The `data-nested` attribute drives the :host([data-nested]) CSS rule that drops the
        // top padding so an embedded (level>0) header sits flush with its host card.
        if (level > 0) this.setAttribute('data-nested', '')
        else this.removeAttribute('data-nested')

        return html`
            ${metadata.breadcrumbs && metadata.breadcrumbs.length > 0 ? html`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${metadata.breadcrumbs.map((breadcrumb, index: number) => html`
                        ${index > 0 ? html`<span>/</span>` : nothing}
                        ${breadcrumb.link
                            ? html`<button class="breadcrumb-link" @click="${() => window.location.href = `${breadcrumb.link}`}">${breadcrumb.text}</button>`
                            : html`<span>${breadcrumb.text}</span>`}
                    `)}
                </div>
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
                    ${metadata.avatar ? renderComponent(this, metadata.avatar, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData) : nothing}
                    <div style="flex: 1; min-width: min(22rem, 100%); overflow: hidden;">
                        ${metadata?.title && level == 0?html`
                            <div style="display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); min-width: 0;">
                                <h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h2>
                                ${(metadata as any).kpisBelow && metadata.badges?.length
                                    ? metadata.badges.map((b) => renderBadgeMetadata(b, this.state ?? {}, this.data ?? {}))
                                    : nothing}
                            </div>`:nothing}
                        ${metadata?.title && level == 1?html`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h3>`:nothing}
                        ${metadata?.title && level == 2?html`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h4>`:nothing}
                        ${metadata?.title && level == 3?html`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h5>`:nothing}
                        ${metadata?.title && level > 3?html`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h6>`:nothing}

                        ${metadata?.subtitle ? html`<span style="display: inline-block; margin-block-end: 0.83em;">${unsafeHTML(possiblyHtml(metadata?.subtitle, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                        ${metadata?.timestamp ? html`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${unsafeHTML(possiblyHtml(metadata.timestamp, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${!(metadata as any).kpisBelow ? metadata?.kpis?.map((kpi) => html`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(kpi.title)}</div>
                                <div>${unsafeHTML(possiblyHtml(kpi.text, this.state ?? {}, this.data ?? {}))}</div>
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
                            <span class="kpi-value">${unsafeHTML(possiblyHtml(kpi.text, this.state ?? {}, this.data ?? {}))}</span>
                        </div>
                    `)}
                </div>
            ` : nothing}
            ${metadata.badges && metadata.badges.length > 0 && !(metadata as any).kpisBelow ? html`
                <div style="display: flex; gap: var(--lumo-space-s, .5rem); padding-bottom: var(--lumo-space-s, .5rem);">
                    ${metadata.badges.map((b) => renderBadgeMetadata(b, this.state ?? {}, this.data ?? {}))}
                </div>
            ` : nothing}
        `
    }

    static styles = css`
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
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-content-header': MateuContentHeader
    }
}
