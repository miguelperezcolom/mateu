import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Gantt from "@mateu/shared/apiClients/dtos/componentmetadata/Gantt";
import { html, nothing } from "lit";
import "@infra/ui/mateu-gantt.ts";

export const renderGantt = (component: ClientSideComponent) => {
    const metadata = component.metadata as Gantt
    return html`
        <mateu-gantt
                .tasks="${metadata.tasks ?? []}"
                .onTaskSelectionActionId="${metadata.onTaskSelectionActionId ?? ''}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-gantt>
    `
}
