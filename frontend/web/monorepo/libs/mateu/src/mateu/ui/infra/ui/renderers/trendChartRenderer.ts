import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import TrendChart from "@mateu/shared/apiClients/dtos/componentmetadata/TrendChart";
import { html, nothing } from "lit";
import "@infra/ui/mateu-trend-chart.ts";

export const renderTrendChart = (component: ClientSideComponent) => {
    const metadata = component.metadata as TrendChart
    return html`
        <mateu-trend-chart
                heading="${metadata.title ?? nothing}"
                color="${metadata.color ?? nothing}"
                ?area="${metadata.area ?? false}"
                .values="${metadata.values ?? []}"
                .labels="${metadata.labels ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-trend-chart>
    `
}
