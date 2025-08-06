import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Chart from "@mateu/shared/apiClients/dtos/componentmetadata/Chart";
import { html, nothing } from "lit";

export const renderChart = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as Chart

    console.log('metadata', metadata)

    return html`
        <mateu-chart 
                style="${component.style}" 
                class="${component.cssClasses}"
                slot="${component.slot??nothing}" 
                type="${metadata.chartType}" 
                .data="${metadata.chartData}" 
                .options="${metadata.chartOptions}"
        >
        </mateu-chart>
    `
}