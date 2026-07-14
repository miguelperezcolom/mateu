import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Funnel from "@mateu/shared/apiClients/dtos/componentmetadata/Funnel";
import { html, nothing } from "lit";
import "@infra/ui/mateu-funnel.ts";

export const renderFunnel = (component: ClientSideComponent) => {
    const metadata = component.metadata as Funnel
    return html`
        <mateu-funnel
                .stages="${metadata.stages ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-funnel>
    `
}
