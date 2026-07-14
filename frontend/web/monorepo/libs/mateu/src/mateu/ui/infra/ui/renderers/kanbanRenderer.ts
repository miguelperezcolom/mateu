import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Kanban from "@mateu/shared/apiClients/dtos/componentmetadata/Kanban";
import { html, nothing } from "lit";
import "@infra/ui/mateu-kanban.ts";

export const renderKanban = (component: ClientSideComponent) => {
    const metadata = component.metadata as Kanban
    return html`
        <mateu-kanban
                .columns="${metadata.columns ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-kanban>
    `
}
