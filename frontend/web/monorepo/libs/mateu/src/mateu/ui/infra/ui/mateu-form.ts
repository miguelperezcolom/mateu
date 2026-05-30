import { customElement, property } from "lit/decorators.js";
import { css, html, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import './mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

const buttonTheme = (button: Button): string | undefined => {
    const parts: string[] = []
    if (button.color && button.color !== 'normal') {
        parts.push(button.color)
    }
    if (button.buttonStyle) {
        parts.push(button.buttonStyle === 'tertiaryInline' ? 'tertiary-inline' : button.buttonStyle)
    }
    return parts.length ? parts.join(' ') : undefined
}

const isNavButton = (id: string | undefined): boolean =>
    id === 'back' || id === 'backToList' || (!!id && id.startsWith('cancel'))

const renderBtn = (button: Button, handler: (id: string) => void) => html`
    <vaadin-button
            data-action-id="${button.id}"
            theme="${buttonTheme(button) || nothing}"
            @click="${() => handler(button.actionId)}"
            ?disabled="${button.disabled}"
    >${button.iconOnLeft ? html`<vaadin-icon icon="${button.iconOnLeft}"></vaadin-icon>` : nothing}${button.label}${button.iconOnRight ? html`<vaadin-icon icon="${button.iconOnRight}"></vaadin-icon>` : nothing}</vaadin-button>
`

export const possiblyHtml = (
    text: string | undefined,
    // @ts-ignore
    state: any,
    // @ts-ignore
    data: any
): string | undefined => {
    if (text && text.indexOf("${") >= 0) {
        try {
            return eval('`' + text + '`')
        } catch (e: any) {
            return e.message
        }
    }
    return text;
}

@customElement('mateu-form')
export class MateuForm extends MetadataDrivenElement {

    @property()
    state: any

    @property()
    data: any

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    render(): TemplateResult {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        const toolbar = metadata?.toolbar ?? []
        const navButtons = toolbar.filter(b => isNavButton(b.actionId))
        const actionButtons = toolbar.filter(b => !isNavButton(b.actionId))
        const divider = navButtons.length > 0 && actionButtons.length > 0
            ? html`<span class="toolbar-divider"></span>`
            : nothing
        const renderToolbar = () => html`
            ${navButtons.map(b => renderBtn(b, this.handleButtonClick))}
            ${divider}
            ${actionButtons.map(b => renderBtn(b, this.handleButtonClick))}
        `
        return html`
            <vaadin-vertical-layout theme="spacing" class="${this.component?.cssClasses}">
                ${metadata.noHeader ? html`
                    <vaadin-horizontal-layout theme="spacing">
                        ${metadata?.header?.map(component => renderComponent(this, component, this.baseUrl, this.state, this.data, this.appState, this.appData))}
                        ${renderToolbar()}
                    </vaadin-horizontal-layout>
                ` : html`
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                        ${metadata.avatar ? renderComponent(this, metadata.avatar, this.baseUrl, this.state, this.data, this.appState, this.appData) : nothing}
                        <vaadin-vertical-layout style="flex: 1">
                            <h2 style="margin-block-end: 0px;">${unsafeHTML(possiblyHtml(metadata?.title, this.state, this.data))}</h2>
                            <span style="display: inline-block; margin-block-end: 0.83em;">${unsafeHTML(possiblyHtml(metadata?.subtitle, this.state, this.data))}</span>
                        </vaadin-vertical-layout>
                        <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                            ${metadata?.header?.map(component => renderComponent(this, component, this.baseUrl, this.state, this.data, this.appState, this.appData))}
                            ${renderToolbar()}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>
                `}
           
                <div class="form-content" style="width: 100%;">
                    <slot></slot>
                    <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                        <slot name="buttons"></slot>
                    </vaadin-horizontal-layout>
                </div>
            </vaadin-vertical-layout>    
       `
    }

    static styles = css`
        :host {
        }

        .redwood .form-header  {
            background-color: rgb(44, 82, 102);
            color: var(--lumo-base-color);
            padding: 30px;
            font-family: "Times New Roman";
        }

        .form-content {
            padding-bottom: 3rem;
        }

        .toolbar-divider {
            display: inline-block;
            width: 1px;
            height: 1.5rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }

    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form': MateuForm
    }
}


