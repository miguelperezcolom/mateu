import { customElement } from "lit/decorators.js";
import { css, html } from "lit";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

/**
 * Redwood form frame: title/subtitle header row (header-slot actions at the right) + slotted
 * body + button row. Plain flex markup styled with the --oj-* vars (which DO inherit across
 * shadow roots) — no Vaadin components (this used to be the last Vaadin usage in the renderer,
 * and it pulled the whole vendor-vaadin bundle in).
 */
@customElement('mateu-redwood-form')
export class MateuRedwoodForm extends MetadataDrivenElement {

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        return html`
            <div class="form-frame">
                <div class="form-header">
                    <div class="form-titles">
                        ${metadata?.title ? html`<h2>${metadata.title}</h2>` : ''}
                        ${metadata?.subtitle ? html`<span class="form-subtitle">${metadata.subtitle}</span>` : ''}
                    </div>
                    <div class="form-header-actions"><slot name="header"></slot></div>
                </div>
                <slot></slot>
                <div class="form-buttons">
                    <slot name="buttons"></slot>
                </div>
            </div>
       `
    }

    static styles = css`
        :host {
            width: 100%;
        }
        .form-frame {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            width: 100%;
        }
        .form-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            width: 100%;
        }
        .form-titles {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        .form-titles h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--oj-core-text-color-primary, rgb(22, 21, 19));
        }
        .form-subtitle {
            display: inline-block;
            margin-top: .25rem;
            color: var(--oj-core-text-color-secondary, #666);
        }
        .form-header-actions {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: .5rem;
        }
        .form-buttons {
            display: flex;
            gap: .5rem;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redwood-form': MateuRedwoodForm
    }
}
