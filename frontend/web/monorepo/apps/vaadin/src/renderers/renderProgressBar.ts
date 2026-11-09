import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar";
import { html, nothing } from "lit";
import { chromeText } from "@infra/ui/chromeTexts.ts";
import { progressBarTheme } from "@infra/ui/renderers/progressBarRenderer";

/**
 * Vaadin adapter ProgressBar → vaadin-progress-bar (Lumo styling + min support). Lives in apps/vaadin
 * so the core stays @vaadin-free; registered by VaadinComponentRenderer's override (the core renders a
 * native <progress> otherwise).
 */
export const renderProgressBar = (component: ClientSideComponent, state: Record<string, unknown> = {}) => {
    const metadata = component.metadata as ProgressBar
    const value = metadata.valueKey ? state[metadata.valueKey] as number : metadata.value
    // success / error / contrast are vaadin-progress-bar themes; Lumo has no warning one, so it is
    // painted through the bar's value colour
    const theme = progressBarTheme(metadata.theme)
    const barStyle = (component.style ?? '') + (theme === 'warning' ? '--vaadin-progress-value-background: var(--lumo-warning-color, #e6a700);' : '')
    return html`
        <div style="${component.style}">
        <vaadin-progress-bar
                ?indeterminate="${metadata.indeterminate}"
                min="${metadata.min && metadata.min != 0 ? metadata.min : nothing}"
                max="${metadata.max && metadata.max != 0 ? metadata.max : nothing}"
                value="${value != null ? value : nothing}"
                theme="${theme && theme !== 'warning' ? theme : nothing}"
                style="${barStyle || nothing}"
                class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
                aria-label="${metadata.text || chromeText('progress')}"
        ></vaadin-progress-bar>
        ${metadata.text ? html`<span class="text-secondary text-xs" id="sublbl">
    ${metadata.text}
  </span>` : nothing}
        </div>
    `
}
