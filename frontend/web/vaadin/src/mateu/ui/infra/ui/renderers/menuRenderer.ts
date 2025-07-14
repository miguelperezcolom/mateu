import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MenuBar from "@mateu/shared/apiClients/dtos/componentmetadata/MenuBar";
import { html } from "lit";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";

export const renderContextMenu = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as ContextMenu

    return html`
        <vaadin-context-menu .items=${mapItems(metadata.menu)} style="${component.style}" class="${component.cssClasses}">
            ${renderComponent(metadata.wrapped, baseUrl, data)}
        </vaadin-context-menu>
            `
}

export const renderMenuBar = (component: ClientSideComponent) => {
    const metadata = component.metadata as MenuBar

    return html`
        <vaadin-menu-bar .items=${mapItems(metadata.options)}
                         style="${component.style}" class="${component.cssClasses}">
        </vaadin-menu-bar>
            `
}

const mapItems = (options: MenuOption[]): any => {
    return options.map(option => {
        if (option.submenus) {
            return {
                text: option.label,
                route: option.destination?.route,
                selected: option.selected,
                children: mapItems(option.submenus)
            }
        }
        if (option.separator) {
            return {
                component: 'hr'
            }
        }
        return {
            text: option.label,
            route: option.destination?.route,
            selected: option.selected,
        }
    })
}