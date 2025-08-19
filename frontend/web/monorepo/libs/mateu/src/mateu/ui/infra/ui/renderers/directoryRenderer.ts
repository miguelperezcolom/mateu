import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, nothing, TemplateResult } from "lit";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import Directory from "@mateu/shared/apiClients/dtos/componentmetadata/Directory";

export const renderDirectory = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any) => {
    const metadata = component.metadata as Directory

    console.log(baseUrl, state, data)

    return html`
        <div style="display: flex; gap: 3rem; ${component.style}" class="${component.cssClasses}" slot="${component.slot??nothing}">
            ${metadata.menu.map(item => renderItem(item))}
        </div>
            `
}

const renderItem = (item: MenuOption):TemplateResult => {
    return html`
        ${item.submenus?html`
                <vaadin-details summary="${item.label}" opened>
                    <vaadin-vertical-layout theme="spacing">
                        ${item.submenus.map(sub => renderItem(sub))}
                    </vaadin-vertical-layout>
                </vaadin-details>
            `:html`
                <a href="${item.destination.route}">${item.label}</a>
        `}
        `
}