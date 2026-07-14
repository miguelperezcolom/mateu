import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Heatmap from "@mateu/shared/apiClients/dtos/componentmetadata/Heatmap";
import { html, nothing } from "lit";
import "@infra/ui/mateu-heatmap.ts";

export const renderHeatmap = (component: ClientSideComponent) => {
    const metadata = component.metadata as Heatmap
    return html`
        <mateu-heatmap
                .cells="${metadata.cells ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-heatmap>
    `
}
