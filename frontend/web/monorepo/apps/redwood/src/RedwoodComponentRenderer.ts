import { html, nothing, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";

export const changed = (event: Event, fieldId: string) => {
    const element = event.target as HTMLInputElement
    event.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            fieldId
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

export class RedwoodComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {


    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            const metadata = component.metadata as Button
            return html`<oj-c-button
                    id="button1"
                    data-action-id="${metadata.actionId}"
                    label="${metadata.label}"
                    @ojAction=${handleButtonClick}
                    slot="${component.slot??nothing}"
            >
               <!-- <span slot='startIcon' class='oj-ux-ico-information'></span> -->
            </oj-c-button>`
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            const metadata = component.metadata as FormField
            const fieldId = metadata?.fieldId??''
            const value = state && fieldId in state?state[ fieldId]:metadata?.initialValue
            if (metadata.dataType == 'string') {
                return html`<oj-c-input-text
                    id="${component.id}"
                    label-hint="${metadata.label}"
                    label-edge='top'
                    value="${value}"
                    @change="${(e: any) => changed(e, component.id!)}"
            >
                </oj-c-input-text>`
            }
            if (metadata.dataType == 'integer') {
                return html`<oj-c-input-number
                    id="${component.id}"
                    label-hint="${metadata.label}"
                    label-edge='top'
                    value="${value}"
                    @change="${(e:any) => changed(e, component.id!)}"
            >
                </oj-c-input-number>`
            }
        }
        return super.renderClientSideComponent(component, baseUrl, state, data)
    }

}