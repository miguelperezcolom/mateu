import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, TemplateResult } from "lit";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { handleButtonClick } from "@/SapUi5ComponentRenderer.ts";

export const renderButton = (component: ClientSideComponent, _baseUrl: string | undefined, _state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as Button
    return html`<ui5-button
                    part="button"
                    @click=${handleButtonClick}
                    data-action-id="${metadata.actionId}"
                    slot="${component.slot}"
            >${metadata.label}</ui5-button>`

}