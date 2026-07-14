import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Timeline from "@mateu/shared/apiClients/dtos/componentmetadata/Timeline";
import { html, nothing } from "lit";
import "@infra/ui/mateu-timeline.ts";

export const renderTimeline = (component: ClientSideComponent) => {
    const metadata = component.metadata as Timeline
    return html`
        <mateu-timeline
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-timeline>
    `
}
