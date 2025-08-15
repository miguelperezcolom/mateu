import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html } from "lit";

export const renderDialog = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    return html`
        <mateu-dialog 
            .component="${component}"
            baseUrl="${baseUrl}"
            .state="${state}"
            .data="${data}"
        ></mateu-dialog>
            `
}
