import { customElement, property } from "lit/decorators.js";
import { css, html, nothing, TemplateResult } from "lit";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import './mateu-content-header'
import './mateu-form-banners'
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"

export { possiblyHtml } from './mateu-content-header'

@customElement('mateu-form')
export class MateuForm extends MetadataDrivenElement {

    @property()
    state: ComponentState = {}

    @property()
    data: ComponentData = {}

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

    /**
     * Whether this page is already inside a `main` landmark (an app shell's content area): walks up
     * through the shadow roots, as `closest` cannot.
     */
    private insideMain(): boolean {
        let node: Node | null = this.parentNode
        while (node) {
            if (node instanceof Element && (node.getAttribute('role') === 'main' || node.tagName === 'MAIN')) return true
            node = node instanceof ShadowRoot ? node.host : node.parentNode
        }
        return false
    }

    render(): TemplateResult {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        // A MESSAGE page (MessagePage) owns the viewport: its card IS the page — no header band
        // (the card carries the h1), no gaps around it; and, standalone (no shell around it), it is
        // the page's main landmark itself.
        if ((metadata as { template?: { type?: string } } | undefined)?.template?.type === 'MessagePage') {
            return this.insideMain()
                ? html`<div class="message-page-host"><slot></slot></div>`
                : html`<main class="message-page-host"><slot></slot></main>`
        }
        return html`
            <div class="mateu-vlayout ${this.component?.cssClasses ?? ''}">
                <mateu-content-header
                    .metadata="${metadata}"
                    .baseUrl="${this.baseUrl}"
                    .state="${this.state}"
                    .data="${this.data}"
                    .appState="${this.appState}"
                    .appData="${this.appData}"
                ></mateu-content-header>
                ${metadata?.banners?.length ? html`
                    <mateu-form-banners .banners="${metadata.banners}" .state="${this.state}" .data="${this.data}"></mateu-form-banners>` : nothing}
                <div class="form-content" style="width: 100%;">
                    <slot></slot>
                    <div class="mateu-hlayout form-buttons">
                        <slot name="buttons"></slot>
                    </div>
                </div>
            </div>
       `
    }

    static styles = css`
        :host {
        }

        /* DS-neutral replacements for vaadin vertical/horizontal-layout theme="spacing" */
        .mateu-vlayout {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: var(--lumo-space-m, 1rem);
            width: 100%;
        }
        .mateu-hlayout {
            display: flex;
            flex-direction: row;
            /* a row of buttons wraps at phone width instead of scrolling sideways (W-V-REFLOW-2) */
            flex-wrap: wrap;
            align-items: center;
            gap: var(--lumo-space-m, 1rem);
        }

        /* an edge page (a templated foldout, a map): the CONTENT bleeds, the header and banners
           keep the shell's gutter — as mateu-page's do (mateu-ux sets --mateu-edge-header-gutter;
           0 on fixed/full pages). The title, back arrow and actions touched the viewport edges. */
        mateu-content-header,
        mateu-form-banners {
            display: block;
            box-sizing: border-box;
            padding-inline: var(--mateu-edge-header-gutter, 0px);
        }

        .redwood .form-header {
            background-color: rgb(44, 82, 102);
            color: var(--lumo-base-color);
            padding: 30px;
            font-family: "Times New Roman";
        }

        .form-content {
            padding-bottom: 3rem;
        }

        .message-page-host {
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        /* The form's own buttons (Save / Cancel under the fields) keep a clear gap from the last
           field instead of sitting flush against it — the gap mateu-page's .form-content gives a
           reflected form's buttons (max(0.9rem, --lumo-space-l)). On the slotted buttons, not on
           the row, so a form with no buttons leaves no empty band. */
        .form-buttons slot[name='buttons']::slotted(*) {
            margin-block-start: max(0.9rem, var(--lumo-space-l, 1.5rem));
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-form': MateuForm
    }
}
