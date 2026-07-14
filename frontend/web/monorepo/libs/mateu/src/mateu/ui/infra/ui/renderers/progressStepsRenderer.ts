import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProgressSteps from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressSteps";
import { html, nothing } from "lit";
import "@infra/ui/mateu-progress-steps.ts";

export const renderProgressSteps = (component: ClientSideComponent) => {
    const metadata = component.metadata as ProgressSteps
    return html`
        <mateu-progress-steps
                .steps="${metadata.steps ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-progress-steps>
    `
}
