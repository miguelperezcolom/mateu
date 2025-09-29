import { css, html, LitElement, TemplateResult, nothing } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import "@vaadin/card"
import { customElement, property } from 'lit/decorators.js';
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { possiblyHtml } from "@infra/ui/mateu-form.ts";



@customElement('mateu-page')
export class MateuPage extends LitElement {

    @property()
    component?: ClientSideComponent

    @property()
    baseUrl?: string

    @property()
    state?: any

    @property()
    data?: any

    @property()
    value?: any

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
        const metadata = this.component?.metadata as PageComponent

        return html`
            <vaadin-vertical-layout style="width: 100%;">
                    <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                        ${metadata.avatar?renderComponent(this, metadata.avatar, this.baseUrl, this.state, this.data):nothing}
                        <vaadin-vertical-layout>
                            <h2 style="margin-block-end: 0px;">${unsafeHTML(possiblyHtml(metadata?.title, this.state, this.data))}</h2>
                            <span style="display: inline-block; margin-block-end: 0.83em;">${unsafeHTML(possiblyHtml(metadata?.subtitle, this.state, this.data))}</span>
                        </vaadin-vertical-layout>
                        <vaadin-horizontal-layout theme="spacing" slot="end">
                            ${metadata?.header?.map(component => renderComponent(this, component, this.baseUrl, this.state, this.data))}
                            ${metadata?.toolbar?.map(button => html`
                <vaadin-button
                        data-action-id="${button.id}"
                        @click="${() => this.handleButtonClick(button.actionId)}"
                        ?disabled="${button.disabled}"
                >${button.iconOnLeft?html`<vaadin-icon icon="${button.iconOnLeft}"></vaadin-icon>`:nothing}${button.label}${button.iconOnRight?html`<vaadin-icon icon="${button.iconOnRight}"></vaadin-icon>`:nothing}</vaadin-button>
`)}
                        </vaadin-horizontal-layout>
                    </vaadin-horizontal-layout>

                <div class="form-content">
                    <slot></slot>
                    <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                        <slot name="buttons"></slot>
                    </vaadin-horizontal-layout>
                </div>
            </vaadin-vertical-layout>            `
    }

    static styles = css`
        :host {
            width: 100%;
        }
        
        .form-content {
            width: 100%;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}


