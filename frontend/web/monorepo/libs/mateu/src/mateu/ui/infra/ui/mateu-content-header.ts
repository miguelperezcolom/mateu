import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import '@vaadin/button'
import '@vaadin/icon'
import '@vaadin/icons'
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { renderBadgeMetadata } from "@infra/ui/renderers/badgeRenderer.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { badge } from "@vaadin/vaadin-lumo-styles";
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

    handleButtonClick = (actionId: string) => {
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
        return html`
        <vaadin-button
                data-action-id="${button.id}"
                theme="${buttonTheme(button) || nothing}"
                @click="${() => this.handleButtonClick(button.actionId)}"
                ?disabled="${button.disabled}"
        >${button.iconOnLeft ? html`<vaadin-icon icon="${button.iconOnLeft}"></vaadin-icon>` : nothing}${label}${button.iconOnRight ? html`<vaadin-icon icon="${button.iconOnRight}"></vaadin-icon>` : nothing}</vaadin-button>
    `
    }

    // Previous/next peer-object arrows (the Redwood "next/previous object" header element).
    // Navigates like a breadcrumb link; a missing route disables that side.
    renderPeerNav = (peerNav: NonNullable<Form['peerNav']>) => {
        const custom = componentRenderer.get()?.renderPeerNav?.(peerNav)
        if (custom) return custom
        return html`
            <div style="display: flex; gap: var(--lumo-space-xs, .25rem); align-items: center;" class="peer-nav">
                <vaadin-button theme="tertiary icon" class="peer-nav-prev"
                        title="${peerNav.prevLabel ?? 'Previous'}"
                        ?disabled="${!peerNav.prevRoute}"
                        @click="${() => { if (peerNav.prevRoute) window.location.href = peerNav.prevRoute }}">
                    <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                </vaadin-button>
                <vaadin-button theme="tertiary icon" class="peer-nav-next"
                        title="${peerNav.nextLabel ?? 'Next'}"
                        ?disabled="${!peerNav.nextRoute}"
                        @click="${() => { if (peerNav.nextRoute) window.location.href = peerNav.nextRoute }}">
                    <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                </vaadin-button>
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
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                    ${metadata?.header?.map((component: Component) => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
                    ${peerNav ? this.renderPeerNav(peerNav) : nothing}
                    ${navButtons.map(this.renderBtn)}
                    ${divider}
                    ${actionButtons.map(this.renderBtn)}
                </div>
            ` : hasMainHeader ? html`
                <div style="display: flex; gap: var(--lumo-space-m, 1rem); width: 100%; align-items: center;" class="form-header">
                    ${metadata.avatar ? renderComponent(this, metadata.avatar, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData) : nothing}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${metadata?.title && level == 0?html`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h2>`:nothing}
                        ${metadata?.title && level == 1?html`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h3>`:nothing}
                        ${metadata?.title && level == 2?html`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h4>`:nothing}
                        ${metadata?.title && level == 3?html`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h5>`:nothing}
                        ${metadata?.title && level > 3?html`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h6>`:nothing}

                        ${metadata?.subtitle ? html`<span style="display: inline-block; margin-block-end: 0.83em;">${unsafeHTML(possiblyHtml(metadata?.subtitle, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                        ${metadata?.timestamp ? html`<span class="page-timestamp" style="display: block; color: var(--lumo-secondary-text-color, #6b7280); font-size: var(--lumo-font-size-s, .875rem);">${unsafeHTML(possiblyHtml(metadata.timestamp, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                    </div>
                    <div style="display: flex; gap: var(--lumo-space-m, 1rem); align-items: center;">
                        ${metadata?.kpis?.map((kpi) => html`
                            <div style="display: flex; flex-direction: column; align-items: center;">
                                <div>${this.evalLabel(kpi.title)}</div>
                                <div>${unsafeHTML(possiblyHtml(kpi.text, this.state ?? {}, this.data ?? {}))}</div>
                            </div>
                        `)}
                        ${metadata?.header?.map((component: Component) => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
                        ${peerNav ? this.renderPeerNav(peerNav) : nothing}
                        ${navButtons.map(this.renderBtn)}
                        ${divider}
                        ${actionButtons.map(this.renderBtn)}
                    </div>
                </div>
            ` : nothing}
            ${metadata.badges && metadata.badges.length > 0 ? html`
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

        .toolbar-divider {
            display: inline-block;
            width: 1px;
            height: 1.5rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }

        ${badge}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-content-header': MateuContentHeader
    }
}
