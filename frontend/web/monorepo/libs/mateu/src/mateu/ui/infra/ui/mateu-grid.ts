import {customElement, property, state} from "lit/decorators.js";
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
import {GridActiveItemChangedEvent, GridItemToggleEvent, GridSelectedItemsChangedEvent} from "@vaadin/grid/all-imports";
import { badge } from "@vaadin/vaadin-lumo-styles";
import {ifDefined} from "lit/directives/if-defined.js";
import {columnBodyRenderer, gridRowDetailsRenderer} from "@vaadin/grid/lit";
import {dialogRenderer} from "@vaadin/dialog/lit";
import {nanoid} from "nanoid";

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

    @state()
    detailsOpenedItems: any[] = []

    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    private rangeStartItem?: any;

    handleItemToggle(event: GridItemToggleEvent<any>) {
        const { item, selected, shiftKey } = event.detail;

        // If the anchor point isn't set, set it to the current item
        this.rangeStartItem ??= item;

        if (shiftKey) {

            let items = []
            if (this.field?.fieldId && this.state && this.state[this.field.fieldId]) {
                items = this.state[this.field.fieldId]
            }

            // Calculcate the range of items between the anchor point and
            // the current item
            const [rangeStart, rangeEnd] = [this.rangeStartItem, item]
                .map((i) => items.indexOf(i))
                .sort((a, b) => a - b);
            const rangeItems = items.slice(rangeStart, rangeEnd + 1);

            // Update the selection state of items within the range
            // based on the state of the current item
            const newSelectedItems = new Set(this.selectedItems);
            rangeItems.forEach((rangeItem: any) => {
                if (selected) {
                    newSelectedItems.add(rangeItem);
                } else {
                    newSelectedItems.delete(rangeItem);
                }
            });
            this.selectedItems = [...newSelectedItems]
            this.state[this.id + '_selected_items'] = this.selectedItems
        }

        // Update the anchor point to the current item
        this.rangeStartItem = item;
    }


    render():TemplateResult {
        let items = []
        if (this.field?.fieldId && this.state && this.state[this.field.fieldId]) {
            items = this.state[this.field.fieldId]
        }
        const showDetail = this.state[this.field?.fieldId + '_show_detail'] || (this.state['_show_detail'] && this.state['_show_detail'][this.field!.fieldId])
        const editing = this.state[this.field?.fieldId + '_editing'] || (this.state['_editing'] && this.state['_editing'][this.field!.fieldId])

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

        if (this.field?.formPosition && this.field?.formPosition.startsWith('modal')) {
            const grid = this;
            return html`

                ${this.renderMaster(items)}
                
                <vaadin-dialog
                        .opened="${showDetail}"
                        @closed="${() => {
                            grid.dispatchEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: grid.field?.fieldId + '_cancel'
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }}"
                        ${dialogRenderer(() => {
                            return html`
                            <mateu-event-interceptor .target="${grid}">
                                <div style="${this.field?.formStyle??'display: contents;'}">
                                    ${renderComponent(grid, editing?(grid.field?.editor!):grid.field?.createForm!,
                                            grid.baseUrl,
                                            grid.state,
                                            grid.data,
                                            grid.appState,
                                            grid.appData)}
                                </div>
                            </mateu-event-interceptor>
                            `}, [() => nanoid()])}
                ></vaadin-dialog>
                
            `

        } else {
            const orientation = (this.field?.formPosition == 'left' || this.field?.formPosition == 'right')?'horizontal':'vertical'

            return html`
            <vaadin-master-detail-layout
                    style="overflow: unset; width: 100%; ${showDetail && this.field?.minHeightWhenDetailVisible?'min-height: '+this.field?.minHeightWhenDetailVisible+';':''}"
                    orientation="${orientation}"
                    .forceOverlay="${true}"
            >
                ${this.renderMaster(items)}
                <div slot="${showDetail?'detail':'detail-hidden'}" style="${this.field?.formStyle??'display: contents;'}">
                    <div style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem; background-color: var(--lumo-base-color);">
                    ${renderComponent(this, editing?(this.field?.editor!):this.field?.createForm!, this.baseUrl, this.state, this.data, this.appState, this.appData)}
                    </div>
                </div>
                
                
            </vaadin-master-detail-layout>`
        }

    }

    public renderMaster(items: any) {
        const selectedItems = this.selectedItems || []

        return html`<vaadin-vertical-layout>
            <vaadin-grid
                    style="${this.field?.style}"
                    class="${this.field?.cssClasses}"
                    .items="${items}"
                    .selectedItems="${selectedItems}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${(e: GridSelectedItemsChangedEvent<any>) => {
                        this.selectedItems = e.detail.value;
                        this.state[this.id + '_selected_items'] = this.selectedItems
                    }}"
                    @item-toggle="${this.handleItemToggle}"
                    @active-item-changed="${ifDefined((this.field?.detailPath && !this.field?.useButtonForDetail)?(event: GridActiveItemChangedEvent<any>) => {
            if (this.field?.detailPath) {
                const row = event.detail.value
                if (row) {
                    this.detailsOpenedItems = [row]
                } else {
                    this.detailsOpenedItems = []
                }
            }
        }:(e: GridActiveItemChangedEvent<any>) => {
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
        })}"
                    .detailsOpenedItems="${this.detailsOpenedItems}"
                    ${ifDefined(this.field?.detailPath?gridRowDetailsRenderer<any>((item) => html`${renderComponent(
            this,
            item[this.field?.detailPath!],
            this.baseUrl,
            this.state,
            this.data,
            this.appState,
            this.appData
        )}`):undefined)}
                    ?all-rows-visible=${items?.length < 10}
            >
                <span slot="empty-state">Empty list.</span>
                ${(this.field?.readOnly)?nothing:html`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(column =>
            renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data, this.appState, this.appData))}

                ${this.field?.useButtonForDetail?html`
                    <vaadin-grid-column
                            width="80px"
                            flex-grow="0"
                            ${columnBodyRenderer<any>(
            (person, { detailsOpened }) => html`
              <vaadin-button
                theme="tertiary icon"
                aria-label="Toggle details"
                aria-expanded="${detailsOpened ? 'true' : 'false'}"
                @click="${() => {
                this.detailsOpenedItems = this.detailsOpenedItems.length?
                    (this.detailsOpenedItems[0]._rowNumber == person._rowNumber?[]:[person]):[person]
            }}"
              >
                <vaadin-icon
                  .icon="${detailsOpened ? 'lumo:angle-down' : 'lumo:angle-right'}"
                ></vaadin-icon>
              </vaadin-button>
            `,
            []
        )}
                    ></vaadin-grid-column>
                `:nothing}

            </vaadin-grid>
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
                        <vaadin-button @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: this.id + '_move-up'
                            },
                            bubbles: true,
                            composed: true
                        }))}">Move up</vaadin-button>
                        <vaadin-button @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: {
                                actionId: this.id + '_move-down'
                            },
                            bubbles: true,
                            composed: true
                        }))}">Move down</vaadin-button>
                    </vaadin-horizontal-layout>
                `}
        </vaadin-vertical-layout>`;
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


