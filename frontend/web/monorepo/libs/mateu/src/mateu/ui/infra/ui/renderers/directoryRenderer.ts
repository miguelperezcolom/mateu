import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, nothing, TemplateResult } from "lit";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import Directory from "@mateu/shared/apiClients/dtos/componentmetadata/Directory";

export const renderDirectory = (component: ClientSideComponent, _baseUrl: string | undefined, _state: ComponentState, _data: ComponentData) => {
    const metadata = component.metadata as Directory


    return html`
        <div style="display: flex; gap: 3rem; ${component.style}" class="${component.cssClasses}" slot="${component.slot??nothing}">
            ${metadata.menu.map(item => renderItem(item))}
        </div>
            `
}

// DS-neutral directory item — a native <details> group of links (no `@vaadin`); the native
// disclosure is equivalent here, so no adapter override is needed.
const renderItem = (item: MenuOption):TemplateResult => {
    return html`
        ${item.submenus?html`
                <details open>
                    <summary>${item.label}</summary>
                    <div style="display:flex; flex-direction:column; gap:0.25rem; padding-left:0.5rem;">
                        ${item.submenus.map(sub => renderItem(sub))}
                    </div>
                </details>
            `:html`
                <a href="${item.path}">${item.label}</a>
        `}
        `
}