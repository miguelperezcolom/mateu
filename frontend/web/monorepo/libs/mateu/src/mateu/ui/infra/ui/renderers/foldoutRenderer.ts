import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FoldoutLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutLayout";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "@infra/ui/mateu-foldout.ts";

export const renderFoldoutLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as FoldoutLayout
    return html`
        <mateu-foldout
                .panels="${metadata.panels ?? []}"
                style="${component.style}"
                class="${component.cssClasses}"
                slot="${component.slot??nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </mateu-foldout>
    `
}
