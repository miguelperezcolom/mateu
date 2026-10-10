import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover";
import { html, LitElement, nothing } from "lit";
import { popoverRenderer } from "@vaadin/popover/lit"
import "@vaadin/popover";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

// One id per popover, stable across re-renders: the old fixed "show-notifications" id made every
// popover on a page open the first one's content.
const popoverIds = new WeakMap<object, string>()
let popoverSeq = 0
const popoverIdOf = (component: ClientSideComponent) => {
    if (component.id && component.id !== 'fieldId') return 'mateu-popover-' + component.id
    let id = popoverIds.get(component)
    if (!id) { id = 'mateu-popover-' + (++popoverSeq); popoverIds.set(component, id) }
    return id
}

export const renderPopover = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Popover
    const id = popoverIdOf(component)
    // trigger = hover: read-only details (a rate breakdown) open on hover AND focus (keyboard),
    // non-modal; the default click popover stays modal
    const hover = metadata.trigger === 'hover'
    return html`
        <div id="${id}" slot="${component.slot??nothing}" tabindex="${hover ? '0' : nothing}"
             style="${hover ? 'display: inline-block; cursor: help; text-decoration: underline dotted; text-underline-offset: 3px;' : nothing}">${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}</div>
        <vaadin-popover
                for="${id}"
                .trigger="${hover ? ['hover', 'focus'] : ['click']}"
                theme="${hover ? 'arrow' : 'arrow no-padding'}"
                ?modal="${!hover}"
                accessible-name="Details"
                content-width="300px"
                position="bottom"
                ${popoverRenderer(() => html`${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}`, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-popover>
    `
}
