import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar";
import { html, nothing } from "lit";

/*
 * Design-system-neutral ProgressBar — a native <progress> (no `@vaadin`). The Vaadin adapter
 * overrides ProgressBar with vaadin-progress-bar (Lumo styling / min support); other renderers
 * inherit this native bar. Indeterminate = a valueless <progress>.
 */
export const renderProgressBar = (component: ClientSideComponent, state: Record<string, unknown> = {}) => {
    const metadata = component.metadata as ProgressBar
    const value = metadata.valueKey ? state[metadata.valueKey] as number : metadata.value
    const max = metadata.max && metadata.max != 0 ? metadata.max : 1
    const showValue = !metadata.indeterminate && value != null
    return html`
        <div style="${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            <progress
                    style="width:100%;"
                    max="${max}"
                    .value="${showValue ? value : nothing}"
            ></progress>
            ${metadata.text ? html`<span class="text-secondary text-xs" id="sublbl">
    ${metadata.text}
  </span>` : nothing}
        </div>
    `
}
