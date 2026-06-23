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
import '@vaadin/icon';
import '@vaadin/icons';
import {dialogRenderer} from "@vaadin/dialog/lit";
import {nanoid} from "nanoid";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"

@customElement('mateu-grid')
export class MateuGrid extends MetadataDrivenElement {

    @property()
    field: FormField | undefined

    @property()
    state: ComponentState = {}

    @property()
    data: ComponentData = {}

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

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

        // Vaadin distinguishes rows (for selection/active item) by item-id-path = "_rowNumber".
        // Nested/read-only grids may arrive without it (the backend only stamps _rowNumber on
        // direct collection fields), which makes every row share the same id, so selecting one
        // selects all. Stamp a per-row index here as a fallback so each row has a distinct id.
        if (Array.isArray(items)) {
            items.forEach((row: any, i: number) => {
                if (row && typeof row === 'object' && row._rowNumber === undefined) {
                    row._rowNumber = i
                }
            })
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
                                <div id="container" style="${this.field?.formStyle??'display: contents;'}">
                                    <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
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
                    <div id="container" style="padding-left: 2rem; padding-right: 2rem; padding-bottom: 2rem; background-color: var(--lumo-base-color);">
                        <mateu-component id="${this.field?.fieldId}-container"></mateu-component>
                    </div>
                </div>
                
                
            </vaadin-master-detail-layout>`
        }

    }

    public renderMaster(items: any) {
        const selectedItems = this.selectedItems || []

        return html`<vaadin-vertical-layout style="width: 100%;">
            <!-- The field label is rendered by the surrounding mateu-field wrapper; rendering it
                 here too would duplicate it (e.g. "Guests / Guests"). -->
            <vaadin-grid
                    style="${this.field?.onItemSelectionActionId ? 'cursor: pointer;' : ''}${this.field?.style ?? ''}"
                    class="${this.field?.cssClasses}"
                    .items="${items}"
                    .selectedItems="${selectedItems}"
                    item-id-path="${this.field?.itemIdPath}"
                    @selected-items-changed="${(e: GridSelectedItemsChangedEvent<any>) => {
                        this.selectedItems = e.detail.value;
                        this.state[this.id + '_selected_items'] = this.selectedItems
                    }}"
                    @item-toggle="${this.handleItemToggle}"
                    @click="${ifDefined(this.field?.onItemSelectionActionId ? (e: MouseEvent) => {
            // Row-click selection: Vaadin's active-item is not reliably set by a click on a
            // read-only grid, so resolve the clicked row from the grid event context instead.
            const grid = e.currentTarget as unknown as { getEventContext: (ev: Event) => { item?: unknown } }
            const item = grid.getEventContext(e)?.item
            if (item) {
                this.selectedItems = [item]
                this.state[this.id + '_selected_items'] = [item]
                this.dispatchEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: this.field?.onItemSelectionActionId,
                        // Carry the selected row so the handler can read it via
                        // HttpRequest.getClickedRow(...) (mirrors the row-action convention).
                        parameters: { _clickedRow: item }
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        } : undefined)}"
                    @active-item-changed="${ifDefined((this.field?.detailPath && !this.field?.useButtonForDetail)?(event: GridActiveItemChangedEvent<any>) => {
            if (this.field?.detailPath) {
                const row = event.detail.value
                if (row) {
                    this.detailsOpenedItems = [row]
                } else {
                    this.detailsOpenedItems = []
                }
            }
        }:undefined)}"
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
                <span slot="empty-state">${this.field?.label ? `No ${this.field.label.toLowerCase()} added yet.` : 'No items added yet.'}</span>
                ${(this.field?.readOnly)?nothing:html`
                    <vaadin-grid-selection-column drag-select></vaadin-grid-selection-column>
                `}
                ${this.field?.columns?.map(column =>
            renderColumnOrGroup(column, this, this.baseUrl, this.state, this.data, this.appState, this.appData))}

                ${this.field?.useButtonForDetail?html`
                    <vaadin-grid-column
                            width="44px"
                            flex-grow="0"
                            ${columnBodyRenderer<any>(
            (person, { detailsOpened }) => html`
              <vaadin-button
                theme="tertiary icon"
                title="${detailsOpened ? 'Collapse' : 'Expand'}"
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
                        <vaadin-button theme="tertiary icon" @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.id + '_add' },
            bubbles: true, composed: true
        }))}"><vaadin-icon icon="vaadin:plus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon error" @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.id + '_remove' },
            bubbles: true, composed: true
        }))}"><vaadin-icon icon="vaadin:minus"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move up" @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: { actionId: this.id + '_move-up' },
                            bubbles: true, composed: true
                        }))}"><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                        <vaadin-button theme="tertiary icon" title="Move down" @click="${() => this.dispatchEvent(new CustomEvent('action-requested', {
                            detail: { actionId: this.id + '_move-down' },
                            bubbles: true, composed: true
                        }))}"><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>
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


