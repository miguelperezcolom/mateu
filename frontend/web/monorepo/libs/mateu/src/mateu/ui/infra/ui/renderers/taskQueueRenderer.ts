import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import TaskQueue from "@mateu/shared/apiClients/dtos/componentmetadata/TaskQueue";
import { html, nothing } from "lit";
import "@infra/ui/mateu-task-queue.ts";

export const renderTaskQueue = (component: ClientSideComponent) => {
    const metadata = component.metadata as TaskQueue
    return html`
        <mateu-task-queue
                .actionId="${metadata.actionId}"
                .groups="${metadata.groups ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-task-queue>
    `
}
