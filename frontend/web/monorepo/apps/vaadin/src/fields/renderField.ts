import "./mateu-field"  // registers <mateu-field> (and its <mateu-grid>/<mateu-money-field>)
import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField"
import { renderComponent } from "@infra/ui/renderers/renderComponent"
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"

/**
 * Vaadin adapter FormField renderer — the full-featured <mateu-field> element (all 30+ input
 * stereotypes). Moved out of the core switch; the core keeps a native-input neutral fallback.
 */
export const renderField = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered?: boolean): TemplateResult => {
    const field = component.metadata as FormField
    return html`
        <mateu-field
                id="${component.id}"
                .component="${component}"
                .field="${component.metadata}"
                .state="${state}"
                .data="${data}"
                .appState="${appState}"
                .appdata="${appData}"
                style="${component.style}" class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
                data-colspan="${field.colspan}"
                colspan="${(field.colspan ?? 1) > 1 ? field.colspan : nothing}"
                .labelAlreadyRendered="${labelAlreadyRendered}"
        >
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData, labelAlreadyRendered))}
        </mateu-field>
    `
}
