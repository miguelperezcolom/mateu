import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import OrgChart from "@mateu/shared/apiClients/dtos/componentmetadata/OrgChart";
import { html, nothing } from "lit";
import "@infra/ui/mateu-org-chart.ts";

export const renderOrgChart = (component: ClientSideComponent) => {
    const metadata = component.metadata as OrgChart
    return html`
        <mateu-org-chart
                .root="${metadata.root}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-org-chart>
    `
}
