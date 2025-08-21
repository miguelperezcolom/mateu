import { html, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";

export const changed = (event: Event) => {
    const element = event.target as HTMLInputElement
    console.log(event, element.value)
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            //@ts-ignore
            fieldId: element.id
        },
        bubbles: true,
        composed: true
    }))
}

export const handleButtonClick = (event: Event) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
        },
        bubbles: true,
        composed: true
    }))
}

export class SapUi5ComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    // @ts-ignore
    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            const metadata = component.metadata as Button
            return html`<ui5-button
                    part="button"
                    @click=${handleButtonClick}
                    data-action-id="${metadata.actionId}"
            >${metadata.label}</ui5-button>`
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            const metadata = component.metadata as FormField
            const fieldId = metadata?.fieldId??''
            const value = state && fieldId in state?state[ fieldId]:metadata?.initialValue
            if (metadata.dataType == 'string') {
                return html`<ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label><ui5-input
                    id="${component.id}"
                    @change="${changed}"
                    value="${value}"
            >
            </ui5-input>`
            }
            if (metadata.dataType == 'integer') {
                return html`<ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label><ui5-input
                    id="${component.id}"
                    value="${value}"
                    @change="${changed}"
            >
                </ui5-input>`
            }
        }
        return super.renderClientSideComponent(component, baseUrl, state, data)
    }

}