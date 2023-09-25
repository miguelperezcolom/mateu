import {css, html, LitElement, PropertyValues, TemplateResult} from 'lit'
import {customElement, property, state, query} from 'lit/decorators.js'
import Crud from "../../../../../../../shared/apiClients/dtos/Crud";
import "@vaadin/horizontal-layout";
import "@vaadin/button";
import "@vaadin/vaadin-grid";
import "@vaadin/vaadin-grid/vaadin-grid-selection-column";
import "@vaadin/vaadin-grid/vaadin-grid-sort-column";
import "@vaadin/vaadin-grid/vaadin-grid-column";
import "../form/section/fieldGroup/field/fields/field-externalref"
import "./mateu-paginator"
import {columnBodyRenderer} from '@vaadin/grid/lit.js';
import {Grid} from "@vaadin/vaadin-grid";
import {GridSortColumn} from "@vaadin/vaadin-grid/vaadin-grid-sort-column";
import {Button} from "@vaadin/button";
import {badge} from "@vaadin/vaadin-lumo-styles";
import {StatusType} from "../../../../../../../shared/apiClients/dtos/StatusType";
import Column from "../../../../../../../shared/apiClients/dtos/Column";
import '@vaadin/menu-bar';
import {mateuApiClient} from "../../../../../../../shared/apiClients/MateuApiClient";
import {Base64} from "js-base64";
import ConfirmationTexts from "../../../../../../../shared/apiClients/dtos/ConfirmationTexts";
import { dialogRenderer } from 'lit-vaadin-helpers';
import { dialogFooterRenderer } from '@vaadin/dialog/lit';
import {MenuBarItemSelectedEvent} from "@vaadin/menu-bar";
import {mapField} from "./crudFieldMapping";
import {crudUpstream} from "./crudUpstream";
import {CrudState} from "./crudstate";
import {Subscription} from "rxjs";
import {crudService} from "./service";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-crud')
export class MateuCrud extends LitElement {
  /**
   * Copy for the read the docs hint.
   */

  @query('#grid')
  grid!: Grid

  @property()
  baseUrl = ''

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  previousStepId!: string

  @property()
  listId!: string

  @property()
  metadata!: Crud

  @property()
  data: any;

  @state()
  private clickedRow:unknown;

  // @ts-ignore

  private contextMenuOpened?: boolean;

  @state()
  message = '';

  @state()
  canDownload = true;

  @property()
  confirmationOpened = false;

  @property()
  closeConfirmation = () => {
    this.confirmationOpened = false
  };

  @property()
  confirmationAction = () => {};

  @property()
  runConfirmedAction = () => {
    this.confirmationAction()
    this.confirmationOpened = false
  };

  @property()
  confirmationTexts: ConfirmationTexts | undefined;

  @property()
  count = 0;

  @property()
  pageSize = 10;

  @property()
  page = 0;

  @property()
  items:any[] = []

  state: CrudState = {
    journeyId: '',
    listId: '',
    items: [],
    count: 0,
    page: 0,
    sorting: [],
    message: ''
  }

  // upstream channel
  private upstreamSubscription: Subscription | undefined;

  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties)
    if (
        changedProperties.has('journeyId')
        || changedProperties.has('stepId')
        || changedProperties.has('listId')
    ) {
      this.doSearch().then()
    }
  }

  async doSearch() {
    console.log('do search!!!!')

    const page = this.page;
    const pageSize = this.pageSize;
    const sortOrders = this.getSortOrders()

    await this.fetchData({
      listId: this.listId,
      page,
      pageSize,
      sortOrders,
      // @ts-ignore
      filters: this.data,
    });
  }

  getSortOrders(): string {
    const nodelist = this.grid.querySelectorAll('vaadin-grid-sort-column');
    const columns:GridSortColumn[] = Array.from(nodelist);
    const sortOrders = Base64.encode(JSON.stringify(columns.filter(c => c.direction).map(o => {
      let direction = 'None';
      if ('asc' == o.direction) direction = 'Ascending';
      if ('desc' == o.direction) direction = 'Descending';
      return {
        column: o.path,
        order: direction
      }
    })))
    return sortOrders
  }

  async fetchData(params: {
    listId: string
    page: number
    pageSize: number
    filters: object
    sortOrders: string
  }) {
      this.state.journeyId = this.journeyId
      this.state.listId = this.listId
      await crudService.fetch(this.state, params)
  }

  connectedCallback() {
    console.log('connected')
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKey);
    this.upstreamSubscription = crudUpstream.subscribe((state: CrudState) => this.stampState(state))
  }

  private stampState(state: CrudState) {
    if (this.journeyId == state.journeyId && this.listId == state.listId) {
      this.state = state
      this.items = state.items
      this.count = state.count
      this.message = state.message
    }
  }

  disconnectedCallback() {
    console.log('disconnected')
    this.removeEventListener('keydown', this.handleKey)
    super.disconnectedCallback();
    this.upstreamSubscription?.unsubscribe();
  }

  private handleKey(e: KeyboardEvent) {
    if (e.code == 'Enter') {
      this.clickedOnSearch()
    }
  }

  private clickedOnSearch() {
    if (this.page) {
      this.page = 0
    } else {
      setTimeout(() => this.doSearch())
    }
  }

  filterChanged(e:Event) {
    const input = e.currentTarget as HTMLInputElement;
    const obj = {};
    // @ts-ignore
    let newValue = null;
    // @ts-ignore
    if (e.detail && e.detail.value) {
      // @ts-ignore
      newValue = e.detail.value;
    } else {
      newValue  = input.value;
    }
    // @ts-ignore
    obj[input.id] = newValue || null;
    this.data = { ...this.data, ...obj}
  }

  async edit(e:Event) {
    const button = e.currentTarget as Button;
    const obj = {
      // @ts-ignore
      _selectedRow: button.row,
      // @ts-ignore
      __index: button.row.__index,
      __count: this.count
    };
    // @ts-ignore
    this.data = { ...this.data, ...obj}
    this.askForActionRun('__list__' + this.listId + '__edit', this.data)
  }

  async runAction(e:Event) {
    const button = e.currentTarget as Button;
    const actionId = button.getAttribute('actionid');
    if (!actionId) {
      console.log('Attribute actionId is missing for ' + button)
      return
    }

    const action = this.findAction(actionId!)
    if (!action) {
      console.log('No action with id ' + actionId)
      return
    }
    const grid = this.shadowRoot?.getElementById('grid') as Grid
    const obj = {
      // @ts-ignore
      _selectedRows: grid.selectedItems,
      _clickedRow: this.clickedRow
    };
    // @ts-ignore
    const extendedData = { ...this.data, ...obj}
    if (action.confirmationRequired) {
      this.confirmationAction = async () => {
        this.askForActionRun(actionId, extendedData)
      }
      this.confirmationTexts = action.confirmationTexts
      this.confirmationOpened = true;
    } else {
      this.askForActionRun(actionId, extendedData)
    }
  }

  private askForActionRun(actionId: string, data: unknown) {
    this.dispatchEvent(new CustomEvent('runaction', {
      detail: {
        actionId: actionId,
        data: data
      },
      bubbles: true,
      composed: true
    }))
  }

  private findAction(actionId: string) {
    let action = this.metadata.actions.find(a => a.id == actionId);
    return action
  }

  async itemSelected(e: CustomEvent) {
    const obj = {
      // @ts-ignore
      _clickedRow: e.target.row
    };
    // @ts-ignore
    const extendedData = { ...this.data, ...obj}
    await mateuApiClient.runStepAction(this.journeyTypeId, this.journeyId, this.stepId,
        '__list__' + this.listId + '__row__' + e.detail.value.methodNameInCrud, extendedData)
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
      return html`
            <vaadin-grid-sort-column  path="${c.id}" header="${c.caption}" resizable
                                      width="${c.width}" data-testid="column-${c.id}"
                ${columnBodyRenderer(
          (row) => {
            // @ts-ignore
            const status = row[c.id]
            return status?html`<span theme="badge ${this.getThemeForBadgetType(status.type)}">${status.message}</span>`:html``;
          },
          []
      )}>
            </vaadin-grid-sort-column>
          `;
    }
    if (c.type == 'ColumnActionGroup') {
      return html`
        <vaadin-grid-column  path="${c.id}" data-testid="column-${c.id}" header="${c.caption}" width="60px"
                             ${columnBodyRenderer(
                                 (row) => {
                                   // @ts-ignore
                                   const actions = row[c.id]?.actions.map(a => {
                                     return {
                                       ...a,text: a.caption
                                     }
                                   })
                                   return html`
                                     <vaadin-menu-bar
                                         .items=${[{ text: '···', children: actions }]}
                                         theme="tertiary"
                                         .row="${row}"
                                         data-testid="menubar-${c.id}"
                                         @item-selected="${this.itemSelected}"
                                     ></vaadin-menu-bar>
                                   `;
                                 },
                                 []
                             )}
        </vaadin-grid-column>
      `;
    }
    return html`
            <vaadin-grid-sort-column path="${c.id}" header="${c.caption}" resizable
                                     width="${c.width}"
                                     data-testid="column-${c.id}"
            ></vaadin-grid-sort-column>
        `;
  }


  exportItemSelected(event: MenuBarItemSelectedEvent) {
    let item = event.detail.value
    if (item.text == 'Excel') {
      mateuApiClient.getXls(this.journeyTypeId, this.journeyId, this.stepId, this.listId, this.getSortOrders(), this.data)
    } else if (item.text == 'Csv') {
      mateuApiClient.getCsv(this.journeyTypeId, this.journeyId, this.stepId, this.listId, this.getSortOrders(), this.data)
    }
  }

  pageChanged(e: CustomEvent) {
    this.page = e.detail.page;
    console.log('page changed to ' + this.page)
    this.doSearch().then()
  }

  render() {
    // @ts-ignore
    // @ts-ignore
    return html`

      <vaadin-horizontal-layout class="header">
        <div>
          <h3>${this.metadata.title}</h3>
          <p>${this.metadata.subtitle}</p>
        </div>
        <vaadin-horizontal-layout style="justify-content: end; flex-grow: 1; align-items: center;" theme="spacing">
          ${this.metadata.actions.map(a => html`
            <vaadin-button theme="secondary" @click=${this.runAction}
                           data-testid="action-${a.id}"
                           actionId=${a.id}>${a.caption}</vaadin-button>
          `)}
        </vaadin-horizontal-layout>
      </vaadin-horizontal-layout>
      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${this.metadata?.searchForm.fields.slice(0,1).map(f => html`
          <vaadin-text-field id="${f.id}" 
                             data-testid="filter-${f.id}" 
                             label="${f.caption}" 
                             @change=${this.filterChanged}
                             placeholder="${f.placeholder}"
                             value="${this.data[f.id]}"
                             style="flex-grow: 1;"></vaadin-text-field>
        `)}
        <vaadin-button theme="primary" @click="${this.clickedOnSearch}" data-testid="search">Search</vaadin-button>
      </vaadin-horizontal-layout>

      <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
        ${this.metadata?.searchForm.fields.slice(1).map(f => mapField(f, this.filterChanged, this.baseUrl, this.data))}
      </vaadin-horizontal-layout>
      <vaadin-grid id="grid" .items="${this.items}" all-rows-visible>
        <vaadin-grid-selection-column></vaadin-grid-selection-column>

      ${this.metadata?.columns.map(c => {
        return this.getColumn(c)
      })}


        ${this.metadata.canEdit?html`
          <vaadin-grid-column
              frozen-to-end
              auto-width
              flex-grow="0"
              ${columnBodyRenderer(
                  (row) => html`<vaadin-button theme="tertiary-inline" .row="${row}" @click="${this.edit}" data-testid="edit-${this.getRowId(row)}">Edit</vaadin-button>`,
                  []
              )}></vaadin-grid-column>
        `:''}
        
        </vaadin-grid>
      
      <vaadin-horizontal-layout style="align-items: baseline; width: 100%;" theme="spacing">
        <div style=" flex-grow: 1;">${this.message}</div>
        <div style="justify-content: end;">
          <mateu-paginator
                            @page-changed="${this.pageChanged}"
                            count="${this.count}"
                            pageSize="${this.pageSize}"
                            data-testid="pagination"
                            .page=${this.page}
            ></mateu-paginator>
        </div>
        <div style="justify-content: end;">
          <vaadin-menu-bar
              .items=${[{ text: 'Export as ...', children: [
                  {text: 'Excel'},
                  {text: 'Csv'}
                ] }]}
              theme="tertiary"
              data-testid="export-menu"
              @item-selected="${this.exportItemSelected}"
          ></vaadin-menu-bar>
        </div>
      </vaadin-horizontal-layout>


      <vaadin-dialog
          header-title="${this.confirmationTexts?.title}"
          .opened="${this.confirmationOpened}"
          ${dialogRenderer(() => html`${this.confirmationTexts?.message}`, [])}
          ${dialogFooterRenderer(
              () => html`
      <vaadin-button theme="primary error" @click="${this.runConfirmedAction}" style="margin-right: auto;" data-testid="dialog-confirm">
        ${this.confirmationTexts?.action}
      </vaadin-button>
      <vaadin-button theme="tertiary" @click="${this.closeConfirmation}" data-testid="dialog-cancel">Cancel</vaadin-button>
    `,
              []
          )}
      ></vaadin-dialog>
    `
  }

  getRowId(row: unknown): unknown {
        // @ts-ignore
    return row.id;
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
  
  .menu {
    /* color: var(--lumo-secondary-text-color); */
    color: grey;
    height: 1.2rem;
  }
  
    :host {

    }

  `

}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-crud': MateuCrud
  }
}
//hola
