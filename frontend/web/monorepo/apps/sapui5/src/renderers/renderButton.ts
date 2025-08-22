import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, TemplateResult } from "lit";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { handleButtonClick } from "@/SapUi5ComponentRenderer.ts";

export const renderButton = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as Button
    return html`<ui5-button
                    part="button"
                    @click=${handleButtonClick}
                    data-action-id="${metadata.actionId}"
            >${metadata.label}</ui5-button>`

}