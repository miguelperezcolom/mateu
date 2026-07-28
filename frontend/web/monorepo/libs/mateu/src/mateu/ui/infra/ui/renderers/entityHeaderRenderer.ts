import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import EntityHeader from "@mateu/shared/apiClients/dtos/componentmetadata/EntityHeader";
import { html, nothing } from "lit";
import "@infra/ui/mateu-entity-header.ts";

export const renderEntityHeader = (component: ClientSideComponent) => {
    // hoisted into the canonical page header by pageRenderer — don't repeat it in the body
    if ((component as any).__hoistedToPageHeader) return html``
    const metadata = component.metadata as EntityHeader
    return html`
        <mateu-entity-header
                .title="${metadata.title ?? ''}"
                .badges="${metadata.badges ?? []}"
                .subtitle="${metadata.subtitle}"
                .facts="${metadata.facts ?? []}"
                .metricLabel="${metadata.metricLabel}"
                .metricValue="${metadata.metricValue}"
                .metricCaption="${metadata.metricCaption}"
                style="${component.style??nothing}"
                class="${component.cssClasses??nothing}"
                slot="${component.slot??nothing}"
        ></mateu-entity-header>
    `
}
