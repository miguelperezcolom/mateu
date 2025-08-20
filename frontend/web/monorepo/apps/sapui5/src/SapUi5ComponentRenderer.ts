import { html, type TemplateResult } from 'lit';
import type { ComponentRenderer } from 'mateu'
import { BasicComponentRenderer } from 'mateu'
import type { ClientSideComponent } from "mateu"

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

    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        console.log('render redwood', component)
        // @ts-ignore
        if (component?.metadata.type == 'Button' ) {
            return html`<ui5-button
                    part="button"
                    @click=${handleButtonClick}
            >${component.metadata.label}</ui5-button>`
        }

        return super.renderClientSideComponent(component, baseUrl, state, data)
    }

}