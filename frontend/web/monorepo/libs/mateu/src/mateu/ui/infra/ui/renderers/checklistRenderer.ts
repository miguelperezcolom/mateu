import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Checklist from "@mateu/shared/apiClients/dtos/componentmetadata/Checklist";
import { html, nothing } from "lit";
import "@infra/ui/mateu-checklist.ts";

export const renderChecklist = (component: ClientSideComponent) => {
    const metadata = component.metadata as Checklist
    return html`
        <mateu-checklist
                heading="${metadata.title ?? nothing}"
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-checklist>
    `
}
