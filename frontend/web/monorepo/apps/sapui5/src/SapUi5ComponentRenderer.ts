import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { renderForm } from "@/renderers/renderForm.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";

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
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        if (ComponentMetadataType.App == component?.metadata?.type) {
            return renderApp(container as MateuApp, component, baseUrl, state, data)
        }
        if (ComponentMetadataType.Form == component?.metadata?.type) {
            return renderForm(container, component, baseUrl, state, data)
        }
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            return renderButton(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            return renderField(component, baseUrl, state, data)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data)
    }

}