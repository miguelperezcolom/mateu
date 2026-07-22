import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/*
 * Design-system-neutral Card — a native card surface div (no `@vaadin`, no named slots; the parts
 * render inline). The Vaadin adapter overrides Card with vaadin-card (Lumo card + slots). Styled with
 * Lumo custom-property fallbacks so it inherits whatever theme the active renderer loads.
 */
const SURFACE = 'display:block; box-sizing:border-box; background:var(--lumo-base-color,#fff); border:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.1)); border-radius:var(--lumo-border-radius-l,12px); box-shadow:var(--lumo-box-shadow-xs,0 1px 3px rgba(0,0,0,.08)); overflow:hidden;'

export const renderCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Card
    if (!metadata) {
        return html``
    }
    const r = (c: unknown) => c ? renderComponent(container, c as ClientSideComponent, baseUrl, state, data, appState, appData, false) : nothing
    const hasHead = metadata.header || metadata.headerPrefix || metadata.headerSuffix || metadata.title || metadata.subtitle
    return html`
        <div style="${SURFACE}${component.style}" class="${component.cssClasses}" slot="${component.slot??nothing}">
            ${metadata.media ? r(metadata.media) : nothing}
            ${hasHead ? html`<div style="display:flex; align-items:flex-start; gap:.75rem; padding:1rem 1.25rem ${metadata.content||metadata.footer ? '0' : '1rem'};">
                ${metadata.headerPrefix ? r(metadata.headerPrefix) : nothing}
                <div style="flex:1; min-width:0;">
                    ${metadata.header ? r(metadata.header) : nothing}
                    ${metadata.title ? html`<div style="font-weight:600; font-size:1.05rem; color:var(--lumo-body-text-color,#161513);">${r(metadata.title)}</div>` : nothing}
                    ${metadata.subtitle ? html`<div style="color:var(--lumo-secondary-text-color,#667);">${r(metadata.subtitle)}</div>` : nothing}
                </div>
                ${metadata.headerSuffix ? r(metadata.headerSuffix) : nothing}
            </div>` : nothing}
            ${metadata.content ? html`<div style="padding:1rem 1.25rem;">${r(metadata.content)}</div>` : nothing}
            ${metadata.footer ? html`<div style="padding:0 1.25rem 1rem;">${r(metadata.footer)}</div>` : nothing}
        </div>
    `
}