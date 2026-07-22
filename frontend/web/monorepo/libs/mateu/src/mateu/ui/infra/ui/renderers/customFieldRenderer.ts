import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CustomField from "@mateu/shared/apiClients/dtos/componentmetadata/CustomField";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
export const customFieldRenderer = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as CustomField

    // A full-width Notice inside a component-holder field stretches its wrapper too: the
    // custom-field goes width 100% and spans every form column (an explicit colspan still wins).
    const contentMeta = (metadata.content as ClientSideComponent | undefined)?.metadata as { type?: string, fullWidth?: boolean } | undefined
    const fullWidthContent = contentMeta?.type == ComponentMetadataType.Notice && contentMeta.fullWidth === true

    // DS-neutral custom field — a native label + content wrapper (no `@vaadin`). vaadin-custom-field
    // only grouped a label with a holder component here, which a plain div does equivalently.
    return html`
        <div style="display:flex; flex-direction:column; ${fullWidthContent ? 'width: 100%; ' : ''}${component.style}"
             class="${component.cssClasses}"
             slot="${component.slot??nothing}"
             data-colspan="${metadata.colspan || (fullWidthContent ? 99 : nothing)}"
        >
            ${metadata.label ? html`<label style="font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${metadata.label}</label>` : nothing}
            ${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}
        </div>
            `
}
