import { customElement, property } from "lit/decorators.js";
import { css, html, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import './mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { renderColumnOrGroup } from "@infra/ui/renderers/columnRenderers/renderColumn.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { GridActiveItemChangedEvent } from "@vaadin/grid/all-imports";

@customElement('mateu-grid')
export class MateuGrid extends MetadataDrivenElement {

    @property()
    field: FormField | undefined

    @property()
    state: any

    @property()
    data: any

    @property()
    selectedItems: any[] | undefined

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    render():TemplateResult {
        let items = []
        if (this.field?.fieldId && this.state && this.state[this.field.fieldId]) {
            items = this.state[this.field.fieldId]
        }
        const showDetail = this.state[this.field?.fieldId + '_show_detail']
        const editing = this.state[this.field?.fieldId + '_editing']

        return html`
            <vaadin-vertical-layout>
            <vaadin-master-detail-layout
                    style="width: 100%; ${showDetail?'min-height: 20rem;':''}"
            >
                <vaadin-grid
                        style="${this.field?.style}"
                        class="${this.field?.cssClasses}"
                        .items="${items}"
                        .selectedItems="${this.selectedItems}"
                        item-id-path="lineId"
                        @active-item-changed="${(e: GridActiveItemChangedEvent<any>) => {
                            if (this.field?.onItemSelectionActionId) {
                                const item = e.detail.value
                                this.selectedItems = item ? [item] : []
                                this.state[this.id + '_selected_items'] = item ? [item] : []
                                if (item) {
                                    this.dispatchEvent(new CustomEvent('action-requested', {
                                        detail: {
                                            actionId: this.field?.onItemSelectionActionId
                                        },
                                        bubbles: true,
                                        composed: true
                                    }))

                                }
                            }
                        }}"
                        all-rows-visible
                >
                    ${this.field?.columns?.map(column =>
                            renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data))}
                </vaadin-grid>
                <div slot="${showDetail?'detail':'detail-hidden'}" style="display: contents;">
                    <div style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem;">
                    ${renderComponent(this, editing?(this.field?.editor!):this.field?.createForm!, this.baseUrl, this.state, this.data)}
                    </div>
                </div>
                
                
            </vaadin-master-detail-layout>
                ${(this.field?.readOnly)?nothing:html`
                    <vaadin-horizontal-layout theme="spacing">
                        <vaadin-button @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: this.id + '_add'
                            },
                            bubbles: true,
                            composed: true
                        }))}">Add</vaadin-button>
                        <vaadin-button @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: this.id + '_remove'
                            },
                            bubbles: true,
                            composed: true
                        }))}">Remove</vaadin-button>
                    </vaadin-horizontal-layout>
                `}
            </vaadin-vertical-layout>
       `
    }

    static styles = css`
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-grid': MateuGrid
    }
}


