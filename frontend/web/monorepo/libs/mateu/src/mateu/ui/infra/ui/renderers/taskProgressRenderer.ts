import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import TaskProgress from "@mateu/shared/apiClients/dtos/componentmetadata/TaskProgress";
import { html, nothing } from "lit";
import "@infra/ui/mateu-task-progress.ts";

export const renderTaskProgress = (component: ClientSideComponent) => {
    const metadata = component.metadata as TaskProgress
    return html`
        <mateu-task-progress
                .label="${metadata.label}"
                .total="${metadata.total ?? 0}"
                .done="${metadata.done ?? 0}"
                .actionLabel="${metadata.actionLabel}"
                .actionId="${metadata.actionId}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-task-progress>
    `
}
