import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Chart from "@mateu/shared/apiClients/dtos/componentmetadata/Chart";
import { html, nothing } from "lit";

export const renderChart = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as Chart

    const columnOptions = { yAxis: { title: { text: '' } } }

    return html`
        <vaadin-chart
      type="column"
      .categories="${['Jan', 'Feb', 'Mar']}"
      .additionalOptions="${columnOptions}"
      style="${component.style}" class="${component.cssClasses}"
      slot="${component.slot??nothing}"
    >
      <vaadin-chart-series title="Tokyo" .values="${[49.9, 71.5, 106.4]}"></vaadin-chart-series>
      <vaadin-chart-series title="New York" .values="${[83.6, 78.8, 98.5]}"></vaadin-chart-series>
      <vaadin-chart-series title="London" .values="${[48.9, 38.8, 39.3]}"></vaadin-chart-series>
    </vaadin-chart>
    `
}