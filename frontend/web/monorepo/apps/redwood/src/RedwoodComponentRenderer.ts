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

export class RedwoodComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {


    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        console.log('render redwood', component)
        // @ts-ignore
        if (component?.metadata.type == 'Button' ) {
            return html`<oj-c-button
                    id="button1"
                    data-action-id="${component.metadata.actionId}"
                    label="${component.metadata.label}"
                    @ojAction=${handleButtonClick}
                    part="button"
            >
               <!-- <span slot='startIcon' class='oj-ux-ico-information'></span> -->
            </oj-c-button>`
        }
        return super.renderClientSideComponent(component, baseUrl, state, data)
    }

}