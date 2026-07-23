import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MenuBar from "@mateu/shared/apiClients/dtos/componentmetadata/MenuBar";
import { html, LitElement, nothing, render } from "lit";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Component from "@mateu/shared/apiClients/dtos/Component";
import { appData, appState } from "@domain/state.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import type { MenuBarItem } from "@vaadin/menu-bar";
import type { MenuBarItem as AppMenuBarItem } from "@infra/ui/mateu-app.ts";
import "@vaadin/menu-bar";
import "@vaadin/context-menu";

// The app shell's top navigation (menu-on-top), rendered as a vaadin-menu-bar — the Vaadin
// override for the DS-neutral <details> strip (renderNeutralNav). Items arrive already mapped by
// MateuApp.mapItems; a top item with children becomes a dropdown that closes on select / outside
// click (native <details> did neither). onSelect is the shell's existing itemSelected handler.
export const renderTopNav = (items: AppMenuBarItem[], onSelect: (item: AppMenuBarItem) => void, cls?: string) => html`
    <vaadin-menu-bar
        .items=${items as unknown as MenuBarItem[]}
        class="${cls ?? nothing}"
        @item-selected=${(e: CustomEvent) => onSelect((e.detail as { value: AppMenuBarItem }).value)}>
    </vaadin-menu-bar>`
export const renderContextMenu = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as ContextMenu

    return html`
        <vaadin-context-menu .items=${mapItems(container, metadata.menu, baseUrl, state, data, appState, appData)} 
                             style="${component.style}" 
                             class="${component.cssClasses}"
                             open-on="${metadata.activateOnLeftClick?'click':nothing}"
                             slot="${component.slot??nothing}">
            ${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}
        </vaadin-context-menu>
            `
}

export const renderMenuBar = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData) => {
    const metadata = component.metadata as MenuBar

    return html`
        <vaadin-menu-bar .items=${mapItems(container, metadata.options, baseUrl, state, data, appState, appData)}
                         style="${component.style}" class="${component.cssClasses}"
                         slot="${component.slot??nothing}">
        </vaadin-menu-bar>
            `
}

const createItem = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const item = document.createElement('vaadin-context-menu-item');
    render(renderComponent(container, component, baseUrl, state, data, appState, appData), item)
    return item
}

const mapItems = (container: LitElement, options: MenuOption[], baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): MenuBarItem[] => {
    return options.map(option => {
        if (option.submenus) {
            return {
                text: option.component?undefined:option.label,
                route: option.path,
                checked: option.selected,
                disabled: option.disabled,
                className: option.className,
                component: option.component?createItem(container, option.component, baseUrl, state, data, appState, appData):undefined,
                children: mapItems(container, option.submenus, baseUrl, state, data, appState, appData)
            }
        }
        if (option.separator) {
            return {
                component: 'hr'
            }
        }
        return {
            text: option.component?undefined:option.label,
            route: option.path,
            checked: option.selected,
            disabled: option.disabled,
            className: option.className,
            component: option.component?createItem(container, option.component, baseUrl, state, data, appState, appData):undefined,
        }
    })
}