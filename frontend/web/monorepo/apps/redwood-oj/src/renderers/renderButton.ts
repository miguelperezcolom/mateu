import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, nothing, TemplateResult } from "lit";
import { handleButtonClick } from "@/RedwoodOjComponentRenderer.ts";

export const renderButton = (component: ClientSideComponent, _baseUrl: string | undefined, _state: any, _data: any): TemplateResult => {
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