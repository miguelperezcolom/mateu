import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
    PROJECT_RENDERERS, PROJECT_RENDERER_LABELS, RENDERER_ARTIFACTS, parseProjectSettings, withRenderer, type ProjectRendererId,
} from '../model/projectSettings'

/**
 * The project descriptor's editor (`project.yaml`, `type: Project`) — the settings true of the whole
 * project, today the renderer. Structured data, no canvas. Emits `project-save` {yaml}; the edit is a
 * line edit, so the file's comments and any other keys survive.
 */
@customElement('project-editor')
export class ProjectEditor extends LitElement {
    static styles = css`
        :host { display: block; height: 100%; overflow: auto; background: var(--ve-base, #fff); font: 13px var(--ve-font, system-ui); color: var(--ve-text, #1f2937); }
        .head { padding: 0.8rem 1rem 0.4rem; }
        .head h2 { margin: 0 0 0.2rem; font-size: 15px; }
        .head .sub { color: var(--ve-tertiary, #9ca3af); font-size: 12px; }
        .card { margin: 0.5rem 1rem; border: 1px solid var(--ve-border, #e3e5e8); border-radius: 8px; padding: 0.75rem; max-width: 40rem; }
        fieldset { border: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
        legend { font-weight: 600; margin-bottom: 0.4rem; }
        label { display: flex; gap: 0.5rem; align-items: baseline; cursor: pointer; }
        .artifact { font: 12px ui-monospace, monospace; color: var(--ve-secondary, #6b7280); }
        p { margin: 0.6rem 0 0; color: var(--ve-secondary, #6b7280); font-size: 12px; line-height: 1.5; }
    `

    @property() yaml = ''

    render() {
        const current = parseProjectSettings(this.yaml).renderer
        return html`
            <div class="head"><h2>Project settings</h2>
                <span class="sub">project.yaml · one per project · what the whole project paints with</span></div>
            <div class="card">
                <fieldset>
                    <legend>Renderer</legend>
                    ${PROJECT_RENDERERS.map((r) => html`
                        <label><input type="radio" name="renderer" .value=${r} ?checked=${r === current}
                                      @change=${() => this.choose(r)}>
                            ${PROJECT_RENDERER_LABELS[r]} <span class="artifact">${RENDERER_ARTIFACTS[r]}</span></label>`)}
                </fieldset>
                <p>The editor's canvas and Play open in this renderer, and the static bundle ships it. A served app
                   renders with its Maven dependency — depend on <code>${RENDERER_ARTIFACTS[current]}</code>; the server
                   warns at startup when the two disagree.</p>
            </div>`
    }

    private choose(renderer: ProjectRendererId) {
        const yaml = withRenderer(this.yaml, renderer)
        this.dispatchEvent(new CustomEvent('project-save', { detail: { yaml }, bubbles: true, composed: true }))
    }
}

declare global {
    interface HTMLElementTagNameMap { 'project-editor': ProjectEditor }
}
