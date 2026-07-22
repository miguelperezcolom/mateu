import { customElement } from "lit/decorators.js";
import { css, html, nothing } from "lit";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

@customElement('mateu-sapui5-form')
export class MateuSapUI5Form extends MetadataDrivenElement {

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
            <div class="page-wrapper">
                ${metadata.noHeader ? html`
                    ${metadata.toolbar?.length > 0 ? html`
                        <div class="page-toolbar">
                            <slot name="toolbar"></slot>
                        </div>
                    ` : nothing}
                ` : html`
                    <div class="page-header">
                        <div class="page-title-area">
                            <ui5-title level="H3">${metadata.title}</ui5-title>
                            ${metadata.subtitle ? html`<p class="subtitle">${metadata.subtitle}</p>` : nothing}
                        </div>
                        ${metadata.toolbar?.length > 0 ? html`
                            <div class="page-toolbar">
                                <slot name="toolbar"></slot>
                            </div>
                        ` : nothing}
                    </div>
                `}

                <div class="page-content">
                    <slot></slot>
                </div>

                ${metadata.buttons?.length > 0 ? html`
                    <div class="page-footer">
                        <slot name="buttons"></slot>
                    </div>
                ` : nothing}
            </div>`
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .page-wrapper {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
            box-sizing: border-box;
        }
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .page-title-area {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .subtitle {
            margin: 0;
            color: var(--sapContent_LabelColor, #6a6d70);
            font-size: var(--sapFontSmallSize, 0.75rem);
        }
        .page-toolbar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .page-content {
            width: 100%;
        }
        .page-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--sapGroup_TitleBorderColor, #d9d9d9);
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-form': MateuSapUI5Form
    }
}
