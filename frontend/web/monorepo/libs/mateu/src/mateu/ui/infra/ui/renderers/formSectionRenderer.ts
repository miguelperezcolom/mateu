import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import FormSection from "@mateu/shared/apiClients/dtos/componentmetadata/FormSection.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
export const renderFormSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as FormSection
    const title = metadata.title?.includes('${') ? (container as any)._evalTemplate(metadata.title) : metadata.title
    // Sections are plain divs in this renderer (no card chrome at all) — the DS renderers style
    // sections their own way (redwood-oj borders them, per the RDS section convention).
    return html`<div
                slot="${component.slot??nothing}"
                style="width: 100%; margin-bottom: var(--lumo-space-m); ${component.style}"
                class="${component.cssClasses}"
        >
        ${title ? html`<div style="font-size: var(--lumo-font-size-l); font-weight: 600; color: var(--lumo-header-text-color); margin-bottom: var(--lumo-space-s);">${title}</div>` : nothing}
        ${component.children?.map(content => renderComponent(container, content, baseUrl, state, data, appState, appData))}
    </div>
    `
}
