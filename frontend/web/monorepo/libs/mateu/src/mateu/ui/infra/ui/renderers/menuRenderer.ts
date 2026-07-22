import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MenuBar from "@mateu/shared/apiClients/dtos/componentmetadata/MenuBar";
import { html, LitElement, nothing } from "lit";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/*
 * Design-system-neutral menu renderers — a plain button strip / native <details> dropdowns, no
 * `@vaadin`. The Vaadin adapter (apps/vaadin/renderers/renderMenu) overrides MenuBar/ContextMenu
 * with vaadin-menu-bar / vaadin-context-menu for full fidelity.
 */

const renderOption = (container: LitElement, option: MenuOption, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): unknown => {
    if (option.separator) {
        return html`<span style="align-self: stretch; width: 1px; background: var(--lumo-contrast-20pct, rgba(0,0,0,.2));"></span>`
    }
    if (option.submenus) {
        return html`
            <details style="position: relative;">
                <summary style="cursor: pointer; list-style: none; padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);">
                    ${option.component ? renderComponent(container, option.component, baseUrl, state, data, appState, appData) : option.label} ▾
                </summary>
                <div style="display: flex; flex-direction: column; gap: .1rem; padding: .3rem; min-width: 10rem;
                            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px);
                            background: var(--lumo-base-color, #fff); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15));">
                    ${option.submenus.map(sub => renderOption(container, sub, baseUrl, state, data, appState, appData))}
                </div>
            </details>
        `
    }
    return html`
        <span class="${option.className ?? ''}"
              style="cursor: ${option.disabled ? 'default' : 'pointer'}; opacity: ${option.disabled ? .5 : 1};
                     padding: .35rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
                     ${option.selected ? 'background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));' : ''}">
            ${option.component ? renderComponent(container, option.component, baseUrl, state, data, appState, appData) : option.label}
        </span>
    `
}

export const renderMenuBar = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState?: ComponentState, appData?: ComponentData) => {
    const metadata = component.metadata as MenuBar
    return html`
        <div style="display: flex; flex-wrap: wrap; gap: .25rem; align-items: center; ${component.style}"
             class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${metadata.options?.map(option => renderOption(container, option, baseUrl, state, data, appState ?? {}, appData ?? {}))}
        </div>
    `
}

export const renderContextMenu = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as ContextMenu
    // Neutral fallback: render the wrapped content (the context-menu popup itself is a Vaadin-only
    // enhancement, reinstated by the adapter override).
    return html`
        <div style="${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}
        </div>
    `
}
