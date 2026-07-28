import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import EntityHeader from "@mateu/shared/apiClients/dtos/componentmetadata/EntityHeader.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import Fab from "@mateu/shared/apiClients/dtos/componentmetadata/Fab.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

/** Hoists a page's leading EntityHeader into the canonical page header (the Redwood
 *  "General Overview" anatomy): its title/subtitle become the page title/subtitle, its
 *  badges the header chips and its facts + metric the KPI row — and the banner is NOT
 *  repeated in the body (the node is flagged and entityHeaderRenderer skips it). Only
 *  applies to top-level pages (level 0): an embedded island keeps its banner inline. */
const hoistLeadingEntityHeader = (component: ClientSideComponent): ClientSideComponent => {
    const metadata = component.metadata as PageComponent
    if (((metadata as any)?.level ?? 0) > 0) return component
    const find = (node: any): any => {
        if (node?.metadata?.type === ComponentMetadataType.EntityHeader) return node
        // component-holder fields carry their component inside the METADATA (CustomField
        // .content — the Card pattern), not as children: descend both ways
        const content = node?.metadata?.content
        const kids = [
            ...(node?.children ?? []),
            ...(Array.isArray(content) ? content : content ? [content] : []),
        ]
        for (const child of kids) {
            const hit = find(child)
            if (hit) return hit
        }
        return undefined
    }
    let headerNode: any
    for (const child of component.children ?? []) {
        headerNode = find(child)
        if (headerNode) break
    }
    if (!headerNode) return component
    const eh = headerNode.metadata as EntityHeader
    headerNode.__hoistedToPageHeader = true
    const kpis = [
        ...(eh.facts ?? []).filter(f => f.label || f.value)
            .map(f => ({ title: f.label ?? '', text: f.value ?? '' })),
        ...(eh.metricLabel ? [{ title: eh.metricLabel, text: eh.metricValue ?? '' }] : []),
    ]
    const badges = (eh.badges ?? []).filter(c => c.label)
        .map(c => ({ text: c.label, color: c.color }))
    const merged = {
        ...(metadata as any),
        title: eh.title || metadata.title,
        subtitle: eh.subtitle ?? (metadata as any).subtitle,
        kpis: [...(((metadata as any).kpis) ?? []), ...kpis],
        // facts read as a row of label+value pairs UNDER the title (the VB/Redwood
        // entity-header anatomy), not as the right-side KPI cluster
        kpisBelow: true,
        badges: [...(((metadata as any).badges) ?? []), ...badges],
    }
    return { ...component, metadata: merged } as ClientSideComponent
}

export const renderPage = (container: LitElement, rawComponent: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, standalone?: boolean) => {
    const component = hoistLeadingEntityHeader(rawComponent)
    const metadata = component.metadata as PageComponent
    const fabs: Fab[] = (metadata as any)?.fabs ?? []
    return html`<mateu-page
            .component="${component}"
            baseUrl="${baseUrl}"
            .state="${state}"
            .data="${data}"
            .appState="${appState}"
            .appdata="${appData}"
            slot="${component.slot??nothing}"
            style="${component.style}"
            class="${component.cssClasses}"
            ?standalone="${standalone ?? false}"
    >
        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        ${metadata?.buttons?.map(button => html`
                   ${renderComponent(container, {
            id: button.actionId,
            metadata: button,
            type: ComponentType.ClientSide,
            slot: 'buttons'
        } as unknown as ClientSideComponent, undefined, state, data, appState, appData)}
`)}
        ${fabs.map((fab, idx) => html`
            <button class="page-fab" style="position: fixed; bottom: ${1.5 + idx * 4}rem; right: 5.5rem;"
                @click="${() => container.dispatchEvent(new CustomEvent('action-requested', {
                    detail: { actionId: fab.actionId },
                    bubbles: true,
                    composed: true
                }))}"
                title="${fab.label}">
                ${icon(fab.icon)}
            </button>
        `)}
</mateu-page>
    `
}
