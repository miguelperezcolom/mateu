import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProcessMonitor from "@mateu/shared/apiClients/dtos/componentmetadata/ProcessMonitor";
import { html, nothing } from "lit";
import "@infra/ui/mateu-process-monitor.ts";

export const renderProcessMonitor = (component: ClientSideComponent) => {
    const metadata = component.metadata as ProcessMonitor
    return html`
        <mateu-process-monitor
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-process-monitor>
    `
}
