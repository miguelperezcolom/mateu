import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";

export const renderPage = (_container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`<div
                slot="${component.slot??nothing}"
                style="${component.style}" class="${component.cssClasses}"
        ><mateu-page
            .component="${component}"
            baseUrl="${baseUrl}"
            .state="${state}"
            .data="${data}"
    ></mateu-page>
    `
}