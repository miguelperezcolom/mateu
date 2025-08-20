import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MenuBar from "@mateu/shared/apiClients/dtos/componentmetadata/MenuBar";
import { html, nothing, render } from "lit";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Component from "@mateu/shared/apiClients/dtos/Component";

export const renderContextMenu = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as ContextMenu

    return html`
        <vaadin-context-menu .items=${mapItems(metadata.menu, baseUrl, state, data)} 
                             style="${component.style}" 
                             class="${component.cssClasses}"
                             open-on="${metadata.activateOnLeftClick?'click':nothing}"
                             slot="${component.slot??nothing}">
            ${renderComponent(metadata.wrapped, baseUrl, state, data)}
        </vaadin-context-menu>
            `
}

export const renderMenuBar = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as MenuBar

    return html`
        <vaadin-menu-bar .items=${mapItems(metadata.options, baseUrl, state, data)}
                         style="${component.style}" class="${component.cssClasses}"
                         slot="${component.slot??nothing}">
        </vaadin-menu-bar>
            `
}

const createItem = (component: Component, baseUrl: string | undefined, state: any, data: any) => {
    const item = document.createElement('vaadin-context-menu-item');
    render(renderComponent(component, baseUrl, state, data), item)
    return item
}

const mapItems = (options: MenuOption[], baseUrl: string | undefined, state: any, data: any): any => {
    return options.map(option => {
        if (option.submenus) {
            return {
                text: option.component?undefined:option.label,
                route: option.destination?.route,
                checked: option.selected,
                disabled: option.disabled,
                className: option.className,
                component: option.component?createItem(option.component, baseUrl, state, data):undefined,
                children: mapItems(option.submenus, baseUrl, state, data)
            }
        }
        if (option.separator) {
            return {
                component: 'hr'
            }
        }
        return {
            text: option.component?undefined:option.label,
            route: option.destination?.route,
            checked: option.selected,
            disabled: option.disabled,
            className: option.className,
            component: option.component?createItem(option.component, baseUrl, state, data):undefined,
        }
    })
}