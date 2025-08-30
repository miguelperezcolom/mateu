import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
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
import './mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

@customElement('mateu-form')
export class MateuForm extends MetadataDrivenElement {

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        return html`
            <vaadin-vertical-layout theme="spacing" style="width: 100%;" class="${this.component?.cssClasses}">
                <vaadin-horizontal-layout theme="spacing" style="width: 100%; align-items: center;" class="form-header">
                    <vaadin-vertical-layout>
                        <h2 style="margin-block-end: 0px;">${metadata?.title}</h2>
                        <span style="display: inline-block; margin-block-end: 0.83em;">${metadata?.subtitle}</span>
                    </vaadin-vertical-layout>
                    <vaadin-horizontal-layout theme="spacing" slot="end">
                        ${metadata?.toolbar?.map(button => html`
                <vaadin-button
                        data-action-id="${button.id}"
                        @click="${() => this.handleButtonClick(button.actionId)}"
                >${button.label}</vaadin-button>
`)}
                    </vaadin-horizontal-layout>
                </vaadin-horizontal-layout>
           
                <div class="form-content">
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
            width: 100%;
        }

        .redwood .form-header  {
            background-color: rgb(44, 82, 102);
            color: var(--lumo-base-color);
            padding: 30px;
            font-family: "Times New Roman";
        }

        .form-content {
            width: 100%;
            background-color: var(--lumo-base-color);
            padding-bottom: 3rem;
        }

    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form': MateuForm
    }
}


