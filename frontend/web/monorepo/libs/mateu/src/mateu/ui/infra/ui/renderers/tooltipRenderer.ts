import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Tooltip from "@mateu/shared/apiClients/dtos/componentmetadata/Tooltip";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
// DS-neutral Tooltip — the wrapped content with a native `title` (no `@vaadin`). A native title is
// universally available, so no adapter override is needed.
export const renderTooltip = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Tooltip
    return html`<span title="${metadata.text}" style="${component.style}" class="${component.cssClasses}" slot="${component.slot??nothing}"
        >${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}</span>`
}