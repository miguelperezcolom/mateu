import type { TemplateResult } from 'lit';
import type { ComponentRenderer } from 'mateu'
import { BasicComponentRenderer } from 'mateu'
import type { ClientSideComponent } from "mateu"

export class VaadinComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        return super.renderClientSideComponent(component, baseUrl, state, data)
    }

}