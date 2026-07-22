import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/*
 * Design-system-neutral Popover renderer — a native <details> disclosure (trigger = the wrapped
 * content, body = the popover content), no `@vaadin`. The Vaadin adapter overrides Popover with
 * the vaadin-popover overlay (arrow, positioning, modal).
 */
export const renderPopover = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Popover
    return html`
        <details style="position: relative; ${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            <summary style="list-style: none; cursor: pointer;">${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}</summary>
            <div style="position: absolute; z-index: 100; min-width: 300px; margin-top: .25rem; padding: .6rem .8rem;
                        border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px);
                        background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.2));">
                ${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}
            </div>
        </details>
    `
}
