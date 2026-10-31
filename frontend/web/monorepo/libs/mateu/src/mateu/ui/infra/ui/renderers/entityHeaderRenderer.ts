import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import EntityHeader from "@mateu/shared/apiClients/dtos/componentmetadata/EntityHeader";
import { html, nothing } from "lit";
import "@infra/ui/mateu-entity-header.ts";
import { interpolateFields } from "@infra/ui/interpolation.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export const renderEntityHeader = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    // hoisted into the canonical page header by pageRenderer — don't repeat it in the body
    if ((component as any).__hoistedToPageHeader) return html``
    // the texts interpolate as they do once hoisted into the page header (mateu-content-header)
    const raw = component.metadata as EntityHeader
    const metadata = {
        ...interpolateFields(raw, ['title', 'subtitle', 'metricLabel', 'metricValue', 'metricCaption'], state, data),
        badges: raw.badges?.map(b => interpolateFields(b, ['label'], state, data)),
        facts: raw.facts?.map(f => interpolateFields(f, ['label', 'value'], state, data)),
    }
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
