import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FoldoutLayout from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutLayout";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import "./mateu-vaadin-foldout.ts";

/**
 * Vaadin override of the shared foldout renderer: renders the carousel {@link
 * import('./mateu-vaadin-foldout').MateuVaadinFoldout} instead of the shared collapsible
 * {@code mateu-foldout}. Same wire contract (panels + overview/panel-N slots), so nothing changes
 * on the backend or the other renderers.
 */
export const renderVaadinFoldout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as FoldoutLayout
    return html`
        <mateu-vaadin-foldout
                .panels="${metadata.panels ?? []}"
                .headerTitle="${metadata.headerTitle ?? ''}"
                .badges="${metadata.badges ?? []}"
                .navigation="${metadata.navigation ?? null}"
                overviewEditActionId="${metadata.overviewEditActionId ?? ''}"
                style="${component.style}"
                class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
        </mateu-vaadin-foldout>
    `
}
