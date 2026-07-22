import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar";
import { html, nothing } from "lit";

/**
 * Vaadin adapter ProgressBar → vaadin-progress-bar (Lumo styling + min support). Lives in apps/vaadin
 * so the core stays @vaadin-free; registered by VaadinComponentRenderer's override (the core renders a
 * native <progress> otherwise).
 */
export const renderProgressBar = (component: ClientSideComponent, state: Record<string, unknown> = {}) => {
    const metadata = component.metadata as ProgressBar
    const value = metadata.valueKey ? state[metadata.valueKey] as number : metadata.value
    return html`
        <div style="${component.style}">
        <vaadin-progress-bar
                ?indeterminate="${metadata.indeterminate}"
                min="${metadata.min && metadata.min != 0 ? metadata.min : nothing}"
                max="${metadata.max && metadata.max != 0 ? metadata.max : nothing}"
                value="${value != null ? value : nothing}"
                style="${component.style}"
                class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
        ></vaadin-progress-bar>
        ${metadata.text ? html`<span class="text-secondary text-xs" id="sublbl">
    ${metadata.text}
  </span>` : nothing}
        </div>
    `
}
