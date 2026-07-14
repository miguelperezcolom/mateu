import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FeatureGrid from "@mateu/shared/apiClients/dtos/componentmetadata/FeatureGrid";
import { html, nothing } from "lit";
import "@infra/ui/mateu-feature-grid.ts";

export const renderFeatureGrid = (component: ClientSideComponent) => {
    const metadata = component.metadata as FeatureGrid
    return html`
        <mateu-feature-grid
                .features="${metadata.features ?? []}"
                .columns="${metadata.columns ?? 0}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-feature-grid>
    `
}
