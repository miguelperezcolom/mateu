import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar";
import { html, nothing } from "lit";

/*
 * Design-system-neutral ProgressBar — a native <progress> (no `@vaadin`). The Vaadin adapter
 * overrides ProgressBar with vaadin-progress-bar (Lumo styling / min support); other renderers
 * inherit this native bar. Indeterminate = a valueless <progress>.
 */
/** A ProgressBar's theme as one of the bar themes every renderer knows: success, error (danger
 *  too), warning, contrast; anything else → none (the primary colour). */
export const progressBarTheme = (theme: string | undefined): 'success' | 'error' | 'warning' | 'contrast' | undefined => {
    const t = (theme ?? '').trim().toLowerCase()
    if (t === 'success') return 'success'
    if (t === 'error' || t === 'danger') return 'error'
    if (t === 'warning') return 'warning'
    if (t === 'contrast') return 'contrast'
    return undefined
}

/** The Lumo colour of a bar theme (the neutral <progress> paints it as its accent-color). */
export const PROGRESS_THEME_COLORS: Record<string, string> = {
    success: 'var(--lumo-success-color, #2e7d32)',
    error: 'var(--lumo-error-color, #d32f2f)',
    warning: 'var(--lumo-warning-color, #e6a700)',
    contrast: 'var(--lumo-contrast-80pct, #333)',
}

export const renderProgressBar = (component: ClientSideComponent, state: Record<string, unknown> = {}) => {
    const metadata = component.metadata as ProgressBar
    const value = metadata.valueKey ? state[metadata.valueKey] as number : metadata.value
    const max = metadata.max && metadata.max != 0 ? metadata.max : 1
    const showValue = !metadata.indeterminate && value != null
    const theme = progressBarTheme(metadata.theme)
    return html`
        <div style="${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            <progress
                    style="width:100%;${theme ? ' accent-color: ' + PROGRESS_THEME_COLORS[theme] + ';' : ''}"
                    max="${max}"
                    .value="${showValue ? value : nothing}"
            ></progress>
            ${metadata.text ? html`<span class="text-secondary text-xs" id="sublbl">
    ${metadata.text}
  </span>` : nothing}
        </div>
    `
}
