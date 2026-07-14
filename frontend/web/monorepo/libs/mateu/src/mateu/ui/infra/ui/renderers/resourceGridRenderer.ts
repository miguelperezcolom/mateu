import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ResourceGrid from "@mateu/shared/apiClients/dtos/componentmetadata/ResourceGrid";
import { html, nothing } from "lit";
import "@infra/ui/mateu-resource-grid.ts";

export const renderResourceGrid = (component: ClientSideComponent) => {
    const metadata = component.metadata as ResourceGrid
    return html`
        <mateu-resource-grid
                .actionId="${metadata.actionId}"
                .columns="${metadata.columns ?? 0}"
                .recommendedLabel="${metadata.recommendedLabel}"
                .items="${metadata.items ?? []}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-resource-grid>
    `
}
