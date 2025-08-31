import { MateuForm } from "@infra/ui/mateu-form.ts";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";
import { html } from "lit";

export const renderForm = (container: MateuForm, metadata: Form) => {
    return html`
            <vaadin-vertical-layout theme="spacing">
           <h2 style="margin-block-end: 0px;">${metadata?.title}</h2>
           <span style="display: inline-block; margin-block-end: 0.83em;">${metadata?.subtitle}</span>
           
           <vaadin-horizontal-layout theme="spacing">
               ${metadata?.toolbar?.map(button => html`
                <vaadin-button
                        data-action-id="${button.id}"
                        @click="${() => container.handleButtonClick(button.actionId)}"
                >${button.label}</vaadin-button>
`)}
           </vaadin-horizontal-layout>
           <slot></slot>
           <vaadin-horizontal-layout theme="spacing">
               <slot name="buttons"></slot>
           </vaadin-horizontal-layout>
            </vaadin-vertical-layout>    
       `
}