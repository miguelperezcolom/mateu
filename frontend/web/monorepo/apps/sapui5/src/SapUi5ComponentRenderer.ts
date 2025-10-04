import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { renderPage } from "@/renderers/renderPage.ts";
import { MateuComponent } from "@infra/ui/mateu-component.ts";

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

export const checkboxChanged = (event: Event) => {
    const element = event.target as HTMLInputElement
    console.log(event, element.value)
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.checked,
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
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {

        console.log('render', component?.metadata?.type)

        if (ComponentMetadataType.App == component?.metadata?.type) {
            return renderApp(container as MateuComponent, component, baseUrl, state, data)
        }
        if (ComponentMetadataType.Page == component?.metadata?.type) {
            return renderPage(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            return renderButton(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            return renderField(component, baseUrl, state, data)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

}