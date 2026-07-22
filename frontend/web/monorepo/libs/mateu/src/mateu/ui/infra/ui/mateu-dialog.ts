import { css, html, nothing, TemplateResult } from "lit";
import { customElement, state } from 'lit/decorators.js';
import Dialog from "@mateu/shared/apiClients/dtos/componentmetadata/Dialog";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import ComponentElement from "@infra/ui/ComponentElement.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { interpolateNested } from "@infra/ui/interpolation.ts";
import './mateu-event-interceptor.ts';

/*
 * Design-system-neutral modal dialog — a fixed backdrop + centered card (no `@vaadin`). Preserves
 * the open/close contract ComponentElement/ConnectedElement.closeModal rely on (`opened` state +
 * `close()`), and the mateu-event-interceptor wrappers for event routing. Was a vaadin-dialog.
 */
@customElement('mateu-dialog')
export class MateuDialog extends ComponentElement {

    @state()
    opened = true

    close = () => {
        this.opened = false
        setTimeout(() => this.parentElement?.removeChild(this), 500)
    }

    private onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.opened) { e.stopPropagation(); this.close() }
    }

    connectedCallback() {
        super.connectedCallback()
        this.addEventListener('keydown', this.onKeydown)
    }

    applyFragment(fragment: UIFragment) {
        super.applyFragment(fragment)
        const millis = fragment.state?.['_closeAfterMillis'] as number | undefined
        if (millis) {
            setTimeout(() => this.close(), millis)
        }
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component') && this.component) {
            const metadata = (this.component as ClientSideComponent).metadata as Dialog
            this.state = metadata.initialData
        }
    }

    render(): TemplateResult {
        if (!this.opened) return html``
        const metadata = (this.component as ClientSideComponent).metadata as Dialog
        const title = interpolateNested(metadata.headerTitle, this.state, this.data, this.appState, this.appData)
        const hasHeader = !!(title || metadata.header || metadata.closeButtonOnHeader)

        const sizeStyle = [
            metadata.width ? `width:${metadata.width};` : 'min-width:min(90vw,28rem);',
            metadata.height ? `height:${metadata.height};` : '',
            metadata.top ? `margin-top:${metadata.top};` : '',
        ].join('')

        return html`
            <div class="backdrop ${metadata.modeless ? 'modeless' : ''}"
                 @click="${(e: Event) => { if (!metadata.modeless && e.target === e.currentTarget) this.close() }}">
                <div class="dialog ${metadata.noPadding ? 'no-padding' : ''} ${this.component?.cssClasses ?? ''}" style="${sizeStyle} ${this.component?.style ?? ''}">
                    ${hasHeader ? html`
                        <div class="dialog-header">
                            <mateu-event-interceptor .target="${this}" style="flex:1; min-width:0;">
                                ${title ? html`<span class="dialog-title">${title}</span>` : nothing}
                                ${metadata.header ? renderComponent(this, metadata.header, this.baseUrl, this.state, this.data, this.appState, this.appData) : nothing}
                            </mateu-event-interceptor>
                            ${metadata.closeButtonOnHeader ? html`<button class="dialog-close" @click="${this.close}" aria-label="Close">✕</button>` : nothing}
                        </div>` : nothing}
                    ${metadata.content ? html`
                        <div class="dialog-body">
                            <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width:100%;">
                                ${renderComponent(this, metadata.content, this.baseUrl, this.state, this.data, this.appState, this.appData)}
                            </mateu-event-interceptor>
                        </div>` : nothing}
                    ${metadata.footer ? html`
                        <div class="dialog-footer">
                            <mateu-event-interceptor .target="${this}" style="width:100%;">
                                ${renderComponent(this, metadata.footer, this.baseUrl, this.state, this.data, this.appState, this.appData)}
                            </mateu-event-interceptor>
                        </div>` : nothing}
                </div>
            </div>
        `
    }

    static styles = css`
        .backdrop {
            position: fixed; inset: 0; z-index: 1000;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,.35); padding: 1rem;
        }
        .backdrop.modeless { background: transparent; pointer-events: none; }
        .backdrop.modeless .dialog { pointer-events: all; }
        .dialog {
            max-width: 90vw; max-height: 90vh; overflow: auto;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 12px);
            box-shadow: var(--lumo-box-shadow-xl, 0 12px 40px rgba(0,0,0,.3));
            display: flex; flex-direction: column;
        }
        .dialog-header { display: flex; align-items: center; gap: .5rem; padding: 1rem 1.2rem .5rem; }
        .dialog-title { font-size: var(--lumo-font-size-l, 1.25rem); font-weight: 600; }
        .dialog-close {
            flex: 0 0 auto; border: none; background: transparent; cursor: pointer;
            font-size: 1rem; color: var(--lumo-secondary-text-color, #667); padding: .25rem .4rem; border-radius: 4px;
        }
        .dialog-close:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .dialog-body { padding: .5rem 1.2rem; flex: 1; }
        .dialog.no-padding .dialog-body { padding: 0; }
        .dialog-footer { padding: .5rem 1.2rem 1rem; display: flex; justify-content: flex-end; gap: .5rem; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-dialog': MateuDialog
    }
}
