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
import { badge } from "@vaadin/vaadin-lumo-styles";

@customElement('mateu-grid')
export class MateuGrid extends MetadataDrivenElement {

    @property()
    field: FormField | undefined

    @property()
    state: any

    @property()
    data: any

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

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
        const showDetail = this.state[this.field?.fieldId + '_show_detail'] || this.state['_show_detail'][this.field!.fieldId]
        const editing = this.state[this.field?.fieldId + '_editing'] || this.state['_editing'][this.field!.fieldId]


        if (this.field?.remoteCoordinates) {
            const coords = this.field.remoteCoordinates;
            const filter = ''

            if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                this.data[this.id] = undefined
            }
            if (this.data[this.id]
                && this.data[this.id].content
                && this.data[this.id].totalElements) {
                items = this.data[this.id].content
            } else {
                this.dispatchEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: coords.action,
                        parameters: {
                            searchText: filter,
                            fieldId: this.field?.fieldId,
                            size: 200,
                            page: 0,
                            sort: undefined
                        }
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }

        const orientation = (this.field?.formPosition == 'left' || this.field?.formPosition == 'right')?'horizontal':'vertical'

        return html`
            <vaadin-vertical-layout>
            <vaadin-master-detail-layout
                    style="width: 100%; ${showDetail?'min-height: 20rem;':''}"
                    orientation="${orientation}"
            >
                <vaadin-grid
                        style="${this.field?.style}"
                        class="${this.field?.cssClasses}"
                        .items="${items}"
                        .selectedItems="${this.selectedItems}"
                        item-id-path="${this.field?.itemIdPath}"
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
                    <span slot="empty-state">Empty list.</span>
                    ${this.field?.columns?.map(column =>
                            renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data, this.appState, this.appData))}
                </vaadin-grid>
                <div slot="${showDetail?'detail':'detail-hidden'}" style="display: contents;">
                    <div style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem; background-color: var(--lumo-base-color);">
                    ${renderComponent(this, editing?(this.field?.editor!):this.field?.createForm!, this.baseUrl, this.state, this.data, this.appState, this.appData)}
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
        ${badge}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-grid': MateuGrid
    }
}


