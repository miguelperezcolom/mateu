import {customElement, property, state} from "lit/decorators.js";
import { html, css, LitElement, TemplateResult } from "lit";
import Component from "./interfaces/Component";
import '@vaadin/custom-field'
import '@vaadin/text-field'
import '@vaadin/grid'
import '@vaadin/grid/vaadin-grid-selection-column'
import '@vaadin/grid/vaadin-grid-filter-column'
import '@vaadin/grid/vaadin-grid-sort-column'
import '@vaadin/grid/vaadin-grid-column'
import {badge} from "@vaadin/vaadin-lumo-styles";
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import { columnBodyRenderer, gridRowDetailsRenderer } from "lit-vaadin-helpers";
import {GridActiveItemChangedEvent} from "@vaadin/grid";
import {DialogOpenedChangedEvent} from "@vaadin/dialog";
import {dialogFooterRenderer, dialogRenderer} from "@vaadin/dialog/lit";
import {Button} from "@vaadin/button";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import Column from "../../../../../../../../../../shared/apiClients/dtos/Column";
import {ifDefined} from "lit/directives/if-defined.js";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import { StatusType } from "../../../../../../../../../../shared/apiClients/dtos/StatusType";


@customElement('field-crud')
export class FieldCrud extends LitElement implements Component {

    isInvalid(): boolean | undefined {
        return undefined
    }

    @property()
    required: boolean = false;

    @state()
    detailsOpenedItem: any[] = [];

    setRequired(required: boolean): void {
        this.required = required;
    }

    setField(field: Field): void {
        this.field = field;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setPattern(): void {
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // @ts-ignore
    onValueChanged(event: ValueChangedEvent): void {
    }

    setValue(value: unknown): void {
        this.value = value as [];
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    placeholder = '';

    @property()
    name = '';

    @property()
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.value})
    }

    @property()
    value: never[] | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;


    @state()
    selectedItems = [];

    @state()
    dialogOpened = false;

    @state()
    selectedItem = {};

    @state()
    selectedIndex = -1;


    private delete() {
        if (this.selectedItems.length > 0) {
            this.value = this.value?.filter(obj => obj !== this.selectedItems[0]);
        }
        this.selectedItems = []
        this.onValueChanged({
            fieldId: this.field!.id,
            value: this.value
        })
    }

    mapField = (f: Column, filterChanged: Function, baseUrl: string) => html`
          ${f.type != 'enum'
    && f.type != 'boolean'
          && f.type != 'int'
    && f.type != 'DatesRange'
    && f.type != 'ExternalReference'?html`
            <vaadin-text-field id="${f.id}" label="${f.caption}"
                               value="${this.getFieldValue(f.id)}"
                               @value-changed="${filterChanged}"
            ></vaadin-text-field>
          `:''}
          ${f.type == 'int'?html`
              <vaadin-integer-field id="${f.id}" label="${f.caption}"
                                 value="${this.getFieldValue(f.id)}"
                                 @value-changed="${filterChanged}"
              ></vaadin-integer-field>
          `:''}
          ${f.type == 'boolean'?html`
            <vaadin-checkbox-group
            ><vaadin-checkbox label="Yes"
                              id="${f.id}" label="${f.caption}"
                              value="${this.getFieldValue(f.id)}"
                              @change=${filterChanged}
                              ?checked=${this.getFieldValue(f.id)}
                   ?disabled=${!this.enabled}
                                 ?required=${this.required}
                                 placeholder="${this.placeholder}"></vaadin-checkbox>
            </vaadin-checkbox-group>
          `:''}
          ${f.type == 'date'?html`
            <vaadin-date-picker id="${f.id}" label="${f.caption}" 
                               value="${this.getFieldValue(f.id)}"
                               @change=${filterChanged}></vaadin-date-picker>
          `:''}
          ${f.type == 'enum'?html`
            
            <vaadin-combo-box label="${f.caption}" theme="vertical"
                                @change=${filterChanged}
                              value="${this.getFieldValue(f.id)}"
                           id="${f.id}"
                              .items="${f.attributes.filter(a => a.key == 'choice').map(a => a.value)}"
                              item-label-path="key"
                              item-value-path="value"
            >
            </vaadin-combo-box>
            
            
          `:''}
          ${f.type == 'ExternalReference'?html`
            
            <field-externalref label="${f.caption}" theme="vertical"
                           id="${f.id}"
                               ._attributes="${f.attributes}"
                               value="${this.getFieldValue(f.id)}"
                               baseUrl="${baseUrl}"
                               @filterchanged=${filterChanged}
                              item-label-path="key"
                              item-value-path="value"
            >
            </field-externalref>
            
            
          `:''}
        `;

    private renderDialog = () => html`
    <vaadin-vertical-layout style="align-items: stretch; width: 18rem; max-width: 100%;">
        ${this.field?.attributes.filter(a => a.key == 'column').map(a => a.value as Column)
                .map(c => this.mapField(c, (e:CustomEvent) => {
                            if (e.detail) {
                                this.setFieldValue(c.id, e.detail.value)
                            } else {
                                // @ts-ignore
                                this.setFieldValue(c.id, e.target.checked);
                            }
                        }, this.baseUrl))}
    </vaadin-vertical-layout>
  `;

    private getFieldValue(fieldId: string) {
        // @ts-ignore
        return this.selectedItem[fieldId]
    }

    private setFieldValue(fieldId: string, value: any) {
        // @ts-ignore
        this.selectedItem[fieldId] = value
    }

    private moveNext() {
        this.selectedIndex++;
        // @ts-ignore
        this.selectedItem = this.value[this.selectedIndex]
        this.updateForm()
    }

    private updateForm() {
        setTimeout(() => {
            this.field?.attributes.filter(a => a.key == 'column').map(a => a.value as {id:string, caption:string, type: string})
                .forEach(c => {
                    // @ts-ignore
                    if (document.getElementById(c.id)) {
                        const f = document.getElementById(c.id)
                        if (c.type == 'boolean') {
                            // @ts-ignore
                            f.checked = this.getFieldValue(c.id)
                        } else {
                            // @ts-ignore
                            f.value = this.getFieldValue(c.id)
                        }
                    }
                })
            if (this.selectedIndex <= 0) {
                document.getElementById('moveprev')?.setAttribute('disabled', '')
            } else {
                document.getElementById('moveprev')?.removeAttribute('disabled')
            }
            // @ts-ignore
            if (this.selectedIndex == -1 || this.selectedIndex >= this.value?.length - 1) {
                document.getElementById('movenext')?.setAttribute('disabled', '')
            } else {
                document.getElementById('movenext')?.removeAttribute('disabled')
            }
        })
    }

    private movePrev() {
        this.selectedIndex--;
        // @ts-ignore
        this.selectedItem = this.value[this.selectedIndex]
        this.updateForm()
    }

    private renderFooter = () => {
        return html`
        <vaadin-button id="moveprev" @click=${this.movePrev} ?disabled=${this.selectedIndex <= 0}><vaadin-icon icon="vaadin:arrow-up"></vaadin-button>
        <vaadin-button id="movenext" @click=${this.moveNext} ?disabled=${this.selectedIndex == -1 || this.selectedIndex >= this.value!.length - 1}><vaadin-icon icon="vaadin:arrow-down"></vaadin-button>
    <vaadin-button @click="${this.close}">Cancel</vaadin-button>
    <vaadin-button theme="primary" @click="${this.save}">Save</vaadin-button>
  `;
    }

    private save() {
        if (this.selectedIndex >= 0) {
            // @ts-ignore
            this.value = this.value?.map((e, i) => i == this.selectedIndex?this.selectedItem:e)
        } else {
            if (!this.value) {
                // @ts-ignore
                this.value = Array.of(this.selectedItem)
            } else {
                // @ts-ignore
                this.value = [].concat(this.value, this.selectedItem)
            }
        }
        this.onValueChanged({
            fieldId: this.field!.id,
            value: this.value
        })
        this.close()
    }

    private new() {
        // @ts-ignore
        this.selectedItem = {}
        this.selectedIndex = -1
        this.dialogOpened = true;
        this.updateForm()
    }

    private close() {
        this.dialogOpened = false;
    }

    private edit(e:Event) {
        const button = e.currentTarget as Button;
        // @ts-ignore
        this.selectedIndex = button.index.index;
        // @ts-ignore
        this.selectedItem = button.row
        this.dialogOpened = true
    }

    async itemSelected(e: CustomEvent) {
        const obj = {
            // @ts-ignore
            _clickedRow: e.target.row
        };
        // @ts-ignore
        const extendedData = { ...this.data, ...obj}
        //this.askForActionRun('__list__' + this.field?.id + '__row__' + e.detail.value.methodNameInCrud, extendedData)
    }

    private getThemeForBadgetType(type: StatusType): string {
        switch (type) {
            case StatusType.SUCCESS: return 'success';
            case StatusType.WARNING: return 'warning';
            case StatusType.DANGER: return 'error';
            case StatusType.NONE: return 'contrast';
        }
        return '';
    }

    private getColumn(c: Column): TemplateResult {
        if (c.type == 'Status') {
            if (c.sortable) {
                return html`
            <vaadin-grid-sort-column  path="${c.id}" header="${c.caption}" resizable
                                      id="${this.field?.id}-${c.id}"
                                      width="${ifDefined(c.width?c.width:undefined)}"
                                      flex-grow="${ifDefined(c.width?'0':'1')}"
                                      data-testid="column-${c.id}"
                                      .column="${c}"
                ${columnBodyRenderer(
                    // @ts-ignore
                    (row, model, column) => {
                        // @ts-ignore
                        const status = row[column.path]
                        return status?html`<span theme="badge ${this.getThemeForBadgetType(status.type)}">${status.message}</span>`:html``;
                    },
                    []
                )}>
            </vaadin-grid-sort-column>
          `;
            } else {
                return html`
            <vaadin-grid-column  path="${c.id}" header="${c.caption}" resizable
                                      id="${this.field?.id}-${c.id}"
                                      width="${ifDefined(c.width?c.width:undefined)}"
                                      flex-grow="${ifDefined(c.width?'0':'1')}"
                                      data-testid="column-${c.id}"
                ${columnBodyRenderer(
                    // @ts-ignore
                    (row, model, column) => {
                        // @ts-ignore
                        const status = row[column.path]
                        return status?html`<span theme="badge ${this.getThemeForBadgetType(status.type)}">${status.message}</span>`:html``;
                    },
                    []
                )}>
            </vaadin-grid-column>
          `;
            }
        }
        if (c.type == 'ColumnActionGroup') {
            return html`
        <vaadin-grid-column  path="${c.id}" data-testid="column-${c.id}" header="${c.caption}" width="90px" flex-grow="0"
                             id="${this.field?.id}-${c.id}"  resizable
                             ${columnBodyRenderer(
                // @ts-ignore
                (row, model, column) => {
                    // @ts-ignore
                    const actions = row[column.path]?.actions.map(a => {
                        return {
                            ...a,text: a.caption
                        }
                    })
                    return html`
                                     <vaadin-menu-bar
                                         .items=${[{ text: '···', children: actions }]}
                                         theme="tertiary"
                                         .row="${row}"
                                         data-testid="menubar-${column.path}"
                                         @item-selected="${this.itemSelected}"
                                     ></vaadin-menu-bar>
                                   `;
                },
                []
            )}
        </vaadin-grid-column>
      `;
        }
        if (c.sortable) {
            return html`
            <vaadin-grid-sort-column path="${c.id}" header="${c.caption}" resizable
                                     width="${ifDefined(c.width?c.width:'50px')}"
                                     flex-grow="${ifDefined(c.width?'0':'1')}"
                                     data-testid="column-${c.id}"
                                     id="${this.field?.id}-${c.id}"
                                     text-align="${c.type == 'money'?'end':'start'}"
                                     .column="${c}"
                                     ${columnBodyRenderer(
                // @ts-ignore
                (row, model, column) => {
                    // @ts-ignore
                    let value = '' + row[column.path]
                    if (c.type == 'money') {
                        const floatValue = parseFloat(value);
                        if (floatValue) {
                            value = (floatValue).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
                        } else {
                            value = ''
                        }
                    }
                    return html`${unsafeHTML(value)}`;
                },
                []
            )}
            ></vaadin-grid-sort-column>
        `;
        } else {
            return html`
            <vaadin-grid-column path="${c.id}" header="${c.caption}" resizable
                                     width="${ifDefined(c.width?c.width:'50px')}"
                                     flex-grow="${ifDefined(c.width?'0':'1')}"
                                     data-testid="column-${c.id}"
                                     id="${this.field?.id}-${c.id}"
                                     text-align="${c.type == 'money'?'end':'start'}"
                                     ${columnBodyRenderer(
                // @ts-ignore
                (row, model, column) => {
                    // @ts-ignore
                    let value = '' + row[column.path]
                    if (c.type == 'money') {
                        const floatValue = parseFloat(value);
                        if (floatValue) {
                            value = (floatValue).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
                        } else {
                            value = ''
                        }
                    }
                    return html`${unsafeHTML(value)}`;
                },
                []
            )}
            ></vaadin-grid-column>
        `;
        }

    }

    toColumn = (attribute: any): Column => {
        return {
            id: attribute.id,
            caption: attribute.caption,
            type: attribute.stereotype,
            stereotype: 'column',
            description: attribute.description,
            width: attribute.width,
            detail: attribute.detail,
            sortable: attribute.sortable,
            serverSideSortable: attribute.serverSideSortable
        } as Column
    }

    /*

    {
        "id": "status",
        "type": "Status",
        "stereotype": "column",
        "caption": "Status",
        "description": "",
        "width": null,
        "attributes": [],
        "detail": false,
        "sortable": false,
        "serverSideSortable": false
    },
    {
        "id": "percentComplete",
        "type": "int",
        "stereotype": "column",
        "caption": "Percent complete",
        "description": "",
        "width": null,
        "attributes": [],
        "detail": false,
        "sortable": false,
        "serverSideSortable": false
    }

"attributes": [
    {
        "key": "column",
        "value": {
            "id": "type",
            "type": "column",
            "stereotype": "string",
            "caption": "Type",
            "description": "",
            "width": null,
            "attributes": [],
            "detail": false,
            "sortable": false,
            "serverSideSortable": false
        }
    },
    {
        "key": "column",
        "value": {
            "id": "status",
            "type": "column",
            "stereotype": "Status",
            "caption": "Status",
            "description": "",
            "width": null,
            "attributes": [],
            "detail": false,
            "sortable": false,
            "serverSideSortable": false
        }
    }

     */

    hasDetail() {
        return this.field?.attributes.filter(a => a.key == 'column')
            .map(a => a.value)
            .map(value => this.toColumn(value)).find(c => c.detail);
    }

    render() {
        //const searchable = this.field?.attributes.filter(a => a.key == 'filterable').length;
        const editable = this.field?.attributes.filter(a => a.key == 'editable').length;
        return html`

            <vaadin-custom-field
                    label="${this.label}"
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
            >
                ${this.value?.length?html`
                <vaadin-grid .items="${this.value}"
                             .detailsOpenedItems="${this.detailsOpenedItem}"
                             .selectedItems="${this.selectedItems}"
                             @active-item-changed="${ifDefined(this.hasDetail()?(event: GridActiveItemChangedEvent<never>) => {
                                 const item = event.detail.value;
                                 this.selectedItems = item ? [item] : [];
                                 //this.detailsOpenedItem = [event.detail.value]
                                 if (this.hasDetail() && this.field?.attributes.filter(a => a.key == 'column')
                                         .map(a => a.value)
                                         .map(value => this.toColumn(value)).filter(c => c.detail)) {
                                     const row = event.detail.value
                                     if (row) {
                                         this.detailsOpenedItem = [row]
                                     } else {
                                         this.detailsOpenedItem = []
                                     }
                                 }
                             }:undefined)}"
                             
                             all-rows-visible
                             class="${!this.value?.length?'no-rows':''}"

                             ${gridRowDetailsRenderer(
                                     (detail) => html`
                                <vaadin-vertical-layout>
                                    ${this.field?.attributes.filter(a => a.key == 'column')
                                             .map(a => a.value)
                                             .map(value => this.toColumn(value))
                                             .filter(c => c.detail).map(c =>
                                                     // @ts-ignore    
                                                     html`<div>${detail[c.id]}</div>`)}
                                </vaadin-vertical-layout>
                            `,
                                     []
                             )}>



                ${this.field?.attributes
                            .filter(a => a.key == 'column')
                            .map(a => a.value)
                            .map(value => this.toColumn(value))
                            .filter(c => !c.detail).map(c => {
                        return this.getColumn(c)
                    })}
                    
                    
                    ${editable?html`
                        <vaadin-grid-column
                                frozen-to-end
                                auto-width
                                flex-grow="0"
                                ${columnBodyRenderer(
                        (row, index) => html`
                                        <vaadin-button theme="tertiary-inline" 
                                                       .index="${index}" 
                                                       .row="${row}" 
                                                       @click="${this.edit}" 
                                        >Edit</vaadin-button>`,
                        []
                )}
                        ></vaadin-grid-column>
                    `:''}
                </vaadin-grid>
                `:html`
                    <div class="no-rows">
                        No value
                    </div>
                `}
                ${editable?html`
                    <div class="toolbar">
                        <vaadin-horizontal-layout class="botones">
                            <div class="delete-button">
                                <vaadin-button theme="tertiary error" ?disabled="${!this.selectedItems.length}"
                                               @click="${this.delete}">Delete...</vaadin-button>
                            </div>
                            <vaadin-button theme="primary" @click="${this.new}">New item</vaadin-button>
                        </vaadin-horizontal-layout>
                    </div>
                `:''}
            </vaadin-custom-field>

            <vaadin-dialog
                    header-title="New ${this.label}"
                    .opened="${this.dialogOpened}"
                    @opened-changed="${(event: DialogOpenedChangedEvent) => {
                        this.dialogOpened = event.detail.value;
                    }}"
                    ${dialogRenderer(this.renderDialog, [])}
                    ${dialogFooterRenderer(this.renderFooter, [])}
            ></vaadin-dialog>
            
            `
    }

    static styles = css`

        ${badge}

        [theme~='badge'][theme~='warning'] {
            color: #6f6800;
            background-color: #FFFCC0;
        }
    [theme~='badge'][theme~='warning'][theme~='primary'] {
        color: #ffffff;
        background-color: #6f6800;
    }

        
        vaadin-custom-field {
            width: 100%;
        }
        
        .toolbar {
            padding: var(--lumo-space-s) var(--lumo-space-m);
            background-color: var(--lumo-contrast-5pct);
            border: 1px solid var(--lumo-contrast-10pct);
            border-top: none;
    
            display: flex;
            flex-shrink: 0;
            align-items: baseline;
            justify-content: flex-end;
        }
        
        .no-rows {
            padding: var(--lumo-space-s) var(--lumo-space-m);
            border: 1px solid var(--lumo-contrast-10pct);

            display: flex;
            flex-shrink: 0;
            align-items: baseline;
            justify-content: center;
        }
        
        .botones {
            width: 100%;
        }
        
        .delete-button {
            flex-grow: 1;
        }
        
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-crud': FieldCrud
    }
}

