import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/button'
import '@vaadin/icon'
import '@vaadin/icons'
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { renderBadgeMetadata } from "@infra/ui/renderers/badgeRenderer.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { badge } from "@vaadin/vaadin-lumo-styles";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import type ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata.ts";
import type Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";
import type Component from "@mateu/shared/apiClients/dtos/Component.ts";

export const possiblyHtml = (
    text: string | undefined,
    state: ComponentState,
    data: ComponentData
): string | undefined => {
    void state; void data;  // captured by eval template literal
    if (text && text.indexOf("${") >= 0) {
        try {
            return eval('`' + text + '`')
        } catch (e) {
            return (e as Error).message
        }
    }
    return text;
}

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

    evalLabel = (raw: string) => raw?.includes('${')
        ? new Function('state', 'data', 'return `' + raw + '`')(this.state ?? {}, this.data ?? {})
        : raw

    renderBtn = (button: Button) => {
        if ((this.data ?? {})[button.actionId + '.hidden']) return nothing
        const label = this.evalLabel(button.label)
        return html`
        <vaadin-button
                data-action-id="${button.id}"
                theme="${buttonTheme(button) || nothing}"
                @click="${() => this.handleButtonClick(button.actionId)}"
                ?disabled="${button.disabled}"
        >${button.iconOnLeft ? html`<vaadin-icon icon="${button.iconOnLeft}"></vaadin-icon>` : nothing}${label}${button.iconOnRight ? html`<vaadin-icon icon="${button.iconOnRight}"></vaadin-icon>` : nothing}</vaadin-button>
    `
    }

    render(): TemplateResult {
        const metadata = this.metadata as Form | undefined
        if (!metadata) return html``

        const toolbar: Button[] = metadata.toolbar ?? []
        const navButtons = toolbar.filter((b: Button) => isNavButton(b.actionId))
        const actionButtons = toolbar.filter((b: Button) => !isNavButton(b.actionId))
        const divider = navButtons.length > 0 && actionButtons.length > 0
            ? html`<span class="toolbar-divider"></span>`
            : nothing
        const hasMainHeader = metadata.avatar || metadata.title || metadata.subtitle
            || (metadata.kpis?.length > 0) || (metadata.header?.length > 0) || toolbar.length > 0
        const level = metadata.level ?? 0

        return html`
            ${metadata.breadcrumbs && metadata.breadcrumbs.length > 0 ? html`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="breadcrumbs-bar">
                    ${metadata.breadcrumbs.map((breadcrumb, index: number) => html`
                        ${index > 0 ? html`<span>/</span>` : nothing}
                        ${breadcrumb.link
                            ? html`<vaadin-button theme="tertiary" @click="${() => window.location.href = `${breadcrumb.link}`}">${breadcrumb.text}</vaadin-button>`
                            : html`<span>${breadcrumb.text}</span>`}
                    `)}
                </vaadin-horizontal-layout>
            ` : nothing}
            ${metadata.noHeader ? html`
                <vaadin-horizontal-layout theme="spacing">
                    ${metadata?.header?.map((component: Component) => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
                    ${navButtons.map(this.renderBtn)}
                    ${divider}
                    ${actionButtons.map(this.renderBtn)}
                </vaadin-horizontal-layout>
            ` : hasMainHeader ? html`
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                    ${metadata.avatar ? renderComponent(this, metadata.avatar, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData) : nothing}
                    <div style="flex: 1; min-width: 0; overflow: hidden;">
                        ${level == 0?html`<h2 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h2>`:nothing}
                        ${level == 1?html`<h3 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h3>`:nothing}
                        ${level == 2?html`<h4 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h4>`:nothing}
                        ${level == 3?html`<h5 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h5>`:nothing}
                        ${level > 3?html`<h6 style="margin: 0; margin-block-end: 0px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">${unsafeHTML(possiblyHtml(metadata?.title, this.state ?? {}, this.data ?? {}))}</h6>`:nothing}

                        ${metadata?.subtitle ? html`<span style="display: inline-block; margin-block-end: 0.83em;">${unsafeHTML(possiblyHtml(metadata?.subtitle, this.state ?? {}, this.data ?? {}))}</span>` : nothing}
                    </div>
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        ${metadata?.kpis?.map((kpi) => html`
                            <vaadin-vertical-layout style="align-items: center">
                                <div>${this.evalLabel(kpi.title)}</div>
                                <div>${unsafeHTML(possiblyHtml(kpi.text, this.state ?? {}, this.data ?? {}))}</div>
                            </vaadin-vertical-layout>
                        `)}
                        ${metadata?.header?.map((component: Component) => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
                        ${navButtons.map(this.renderBtn)}
                        ${divider}
                        ${actionButtons.map(this.renderBtn)}
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
            ` : nothing}
            ${metadata.badges && metadata.badges.length > 0 ? html`
                <vaadin-horizontal-layout style="padding-bottom: var(--lumo-space-s);">
                    ${metadata.badges.map((b) => renderBadgeMetadata(b, this.state ?? {}, this.data ?? {}))}
                </vaadin-horizontal-layout>
            ` : nothing}
        `
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
            padding-top: var(--lumo-space-m);
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
