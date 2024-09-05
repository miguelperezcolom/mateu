import {css, html, LitElement, PropertyValues, TemplateResult} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import Crud from "../../../../../../shared/apiClients/dtos/Crud";
import "@vaadin/horizontal-layout";
import "@vaadin/button";
import "@vaadin/vaadin-grid";
import "@vaadin/vaadin-grid/vaadin-grid-selection-column";
import "@vaadin/vaadin-grid/vaadin-grid-sort-column";
import "@vaadin/vaadin-grid/vaadin-grid-column";
import "../form/section/fieldGroup/field/fields/field-externalref"
import "./mateu-paginator"
import {columnBodyRenderer} from '@vaadin/grid/lit.js';
import {Grid, GridActiveItemChangedEvent} from "@vaadin/vaadin-grid";
import {GridSortColumn} from "@vaadin/vaadin-grid/vaadin-grid-sort-column";
import {Button} from "@vaadin/button";
import {badge} from "@vaadin/vaadin-lumo-styles";
import {StatusType} from "../../../../../../shared/apiClients/dtos/StatusType";
import Column from "../../../../../../shared/apiClients/dtos/Column";
import '@vaadin/menu-bar';
import {mateuApiClient} from "../../../../../../shared/apiClients/MateuApiClient";
import {Base64} from "js-base64";
import ConfirmationTexts from "../../../../../../shared/apiClients/dtos/ConfirmationTexts";
import {dialogRenderer, gridRowDetailsRenderer} from 'lit-vaadin-helpers';
import {dialogFooterRenderer} from '@vaadin/dialog/lit';
import {MenuBarItemSelectedEvent} from "@vaadin/menu-bar";
import {mapField} from "./crudFieldMapping";
import {CrudState} from "./crudstate";
import {Subject, Subscription} from "rxjs";
import {CrudService} from "./crudservice";
import Action from "../../../../../../shared/apiClients/dtos/Action";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import {ActionTarget} from "../../../../../../shared/apiClients/dtos/ActionTarget";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";


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

  @query('vaadin-grid')
  grid!: Grid

  @property()
  baseUrl = ''

  @property()
  uiId!: string

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  previousStepId!: string

  @property()
  metadata!: Crud

  @property()
  data: any;

  @property()
  component!: Component

  data0: any;

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

  openedChangedForConfirmation(e:CustomEvent) {
    if (!e.detail.value) {
      this.confirmationOpened = false
    }
  }

  openedChangedForFilters(e:CustomEvent) {
    if (!e.detail.value) {
      this.filtersOpened = false
    }
  }

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

  @state()
  detailsOpenedItem: any[] = [];

  state: CrudState = {
    uiId: '',
    journeyTypeId: '',
    journeyId: '',
    stepId: '',
    listId: '',
    items: [],
    count: 0,
    page: 0,
    filters: {},
    sorting: [],
    message: ''
  }

  // upstream channel
  crudUpstream = new Subject<CrudState>()
  private upstreamSubscription: Subscription | undefined;
  crudService = new CrudService()

  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties)
    if (
        changedProperties.has('component')
    ) {
      this.page = 0
      this.doSearch().then()
    }
  }

  async doSearch() {
    const page = this.page;
    const pageSize = this.pageSize;
    const sortOrders = this.getSortOrders()

    await this.fetchData({
      listId: this.component.id,
      page,
      pageSize,
      sortOrders,
      // @ts-ignore
      filters: this.data
    });

    this.updateFiltersText()
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
      this.state.uiId = this.uiId
      this.state.journeyTypeId = this.journeyTypeId
      this.state.journeyId = this.journeyId
      this.state.stepId = this.stepId
      this.state.listId = this.component.id
      this.state.filters = params.filters
      await this.crudService.fetch(this.state, this.crudUpstream, params, this.component, this.data)
  }

  connectedCallback() {
    super.connectedCallback();
    this.data0 = this.data
    if (this.data.data0) {
      this.data0 = {...this.data.data0}
    }
    this.data.data0 = {...this.data0}
    this.addEventListener('keydown', this.handleKey);
    this.upstreamSubscription = this.crudUpstream.subscribe((state: CrudState) => this.stampState(state))
  }

  private stampState(state: CrudState) {
//    if (this.journeyId == state.journeyId && this.component.id == state.listId) {
      this.state = state
      this.items = state.items
      if (state.count > -1) {
        this.count = state.count
      }
      this.message = state.message
//    }
  }

  disconnectedCallback() {
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
    this.filtersOpened = false
    if (this.page) {
      this.page = 0
    } else {
      setTimeout(() => this.doSearch())
    }
  }

  clickedOnFilters() {
    this.filtersOpened = true
  }

  clickedOnClearFilters() {
    console.log('clear filters', this.data, this.data0)
    this.data = this.data0
    setTimeout(() => this.doSearch())
  }

  @state()
  filtersOpened = false;

  @property()
  closeFilters = () => {
    this.filtersOpened = false
  };


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

  updateFiltersText() {
    let text = '';
    for (const k in this.metadata?.searchForm.fields) {
      const f = this.metadata?.searchForm.fields[k]
      if (this.data[f.id]) {
        if (k != 'action') {
          if (text) text += ', ';
          text += this.data[f.id];
        }
      }
    }
    this.filtersText = 'Applied filters: ' + (text?text:'None')
  }

  @state()
  filtersText = ''

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
    this.askForActionRun('__list__' + this.component.id + '__edit', this.data)
  }

  async runAction(e:Event) {
    const button = e.currentTarget as Button;
    const actionId = button.getAttribute('actionid');
    if (!actionId) {
      console.log('Attribute actionId is missing for ' + button)
      return
    }
    this.doRunAction(actionId)
  }

  async doRunAction(actionId: string) {
    const action = this.findAction(actionId!)
    if (!action) {
      console.log('No action with id ' + actionId)
      return
    }
    const rowsSelectedRequired = action.rowsSelectedRequired
    if (rowsSelectedRequired && this.grid.selectedItems.length == 0) {
      this.confirmationTexts = {
        message: 'You need to first select some rows',
        action: '',
        title: 'Ey'
      }
      this.confirmationOpened = true;
      return
    }
    const obj = {
      // @ts-ignore
      componentId: this.component.id,
      componentType: this.component.className,
      _selectedRows: this.grid.selectedItems,
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
    let action = this.findAction(actionId!)
    if (!action) {
      // @ts-ignore
      action = {
        target: ActionTarget.View,
        id: actionId,
      }
    }

    this.dispatchEvent(new CustomEvent('runaction', {
      detail: {
        componentId: this.component.id,
        componentType: this.component?.className,
        actionId: actionId,
        action: action,
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
    this.askForActionRun('__list__' + this.component.id + '__row__' + e.detail.value.methodNameInCrud, extendedData)
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
                                      id="${this.component.id}-${c.id}"
                                      width="${c.width}" data-testid="column-${c.id}"
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
    }
    if (c.type == 'ColumnActionGroup') {
      return html`
        <vaadin-grid-column  path="${c.id}" data-testid="column-${c.id}" header="${c.caption}" width="60px"
                             id="${this.component.id}-${c.id}"
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
    return html`
            <vaadin-grid-sort-column path="${c.id}" header="${c.caption}" resizable
                                     width="${c.width}"
                                     data-testid="column-${c.id}"
                                     id="${this.component.id}-${c.id}"
                                     ${columnBodyRenderer(
                                         // @ts-ignore
                                         (row, model, column) => {
                                           // @ts-ignore
                                           const value = '' + row[column.path]
                                           return html`${unsafeHTML(value)}`;
                                         },
                                         []
                                     )}
            ></vaadin-grid-sort-column>
        `;
  }


  exportItemSelected(event: MenuBarItemSelectedEvent) {
    let item = event.detail.value
    if (item.text == 'Excel') {
      mateuApiClient.getXls(this.uiId, this.journeyTypeId, this.journeyId, this.stepId, this.component.id, this.getSortOrders(), this.data)
    } else if (item.text == 'Csv') {
      mateuApiClient.getCsv(this.uiId, this.journeyTypeId, this.journeyId, this.stepId, this.component.id, this.getSortOrders(), this.data)
    }
  }

  pageChanged(e: CustomEvent) {
    this.page = e.detail.page;
    this.doSearch().then()
  }

  buildItemsForActions(actions: Action[]) {
    const items = actions.map(a => ({text: a.caption, action: a}))
    return [
      {component: this.createRootActionsComponent(),
        children: items
      }]
  }

  actionItemSelected(event: MenuBarItemSelectedEvent) {
    setTimeout(async () => {
      // @ts-ignore
      await this.doRunAction(event.detail.value.action.id);
    })
  }

  private createRootActionsComponent():HTMLElement {
    const item = document.createElement('vaadin-menu-bar-item');
    const icon = document.createElement('vaadin-icon');
    item.setAttribute('aria-label', 'Other save options');
    icon.setAttribute('icon', `vaadin:ellipsis-dots-v`);
    item.appendChild(icon);
    return item;
  }

  render() {
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return html`

      <vaadin-horizontal-layout class="header" style="align-items: baseline;">
        <div style=" flex-grow: 1;">
          ${this.metadata.child?html`
            <h4>${this.metadata.title}</h4>
            ${this.metadata.subtitle?html`
            <p style="margin-top: -6px;">${this.metadata.subtitle}</p>
          `:''}
          `:html`
            <h2 style="margin-block-end: 0px;">${this.metadata.title}</h2>
            ${this.metadata.subtitle?html`
            <p style="margin-top: -6px;">${this.metadata.subtitle}</p>
          `:''}
          `}
        </div>
        ${!this.metadata?.searchForm.fields || this.metadata?.searchForm.fields.length == 0?html`
            <vaadin-button theme="icon tertiary small" @click="${this.clickedOnSearch}" data-testid="refresh"><vaadin-icon icon="vaadin:refresh" slot="prefix"></vaadin-icon></vaadin-button>
          `:''}
        <vaadin-horizontal-layout style="justify-content: end; align-items: center;" theme="spacing">
          ${this.metadata.actions.filter(a => a.visible).slice(0, 2).map(a => html`
            <vaadin-button theme="secondary" @click=${this.runAction} ?rowsSelectedRequired=${a.rowsSelectedRequired}  actionId=${a.id} data-testid="action-${a.id}">${a.caption}</vaadin-button>
          `)}
          ${this.metadata.actions.filter(a => a.visible).length > 2?html`
              <vaadin-menu-bar theme="icon tertiary small" xopen-on-hover
                               @item-selected="${this.actionItemSelected}"
                               .items="${this.buildItemsForActions(this.metadata.actions
              .filter(a => a.visible).slice(2))}"></vaadin-menu-bar>
            `:''}
        </vaadin-horizontal-layout>      </vaadin-horizontal-layout>
      ${this.metadata?.searchForm.fields && this.metadata?.searchForm.fields.length > 0?html`
        <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
          ${this.metadata?.searchForm.fields.slice(0,1).map(f => html`
          <vaadin-text-field id="${f.id}" 
                             data-testid="filter-${f.id}" 
                             placeholder="${f.caption}" 
                             @change=${this.filterChanged}
                             xplaceholder="${f.placeholder}"
                             value="${this.data[f.id]}"
                             style="flex-grow: 1;" autofocus="true"
                             autoselect="on"></vaadin-text-field>
        `)}
          <vaadin-button theme="primary" @click="${this.clickedOnSearch}" data-testid="search">Search</vaadin-button>
          ${this.metadata?.searchForm.fields && this.metadata?.searchForm.fields.length > 1?html`
            <vaadin-button theme="secondary" @click="${this.clickedOnFilters}" data-testid="filters">Filters</vaadin-button>
            <vaadin-button theme="secondary" @click="${this.clickedOnClearFilters}" data-testid="clearfilters">Clear filters</vaadin-button>
          `:''}
        </vaadin-horizontal-layout>
        <p style="margin-block-start: 0;">${this.filtersText}</p>
      `:''}
      
      <vaadin-grid id="grid-${this.component.id}" .items="${this.items}" all-rows-visible
                   .detailsOpenedItems="${this.detailsOpenedItem}"
                   @active-item-changed="${(event: GridActiveItemChangedEvent<any>) => {
                     //this.detailsOpenedItem = [event.detail.value]
                     if (this.metadata.columns.filter(c => c.detail)) {
                       const row = event.detail.value
                       if (row) {
                         this.detailsOpenedItem = [row]
                       } else {
                         this.detailsOpenedItem = []
                       }
                     }
                   }}"
                   ${gridRowDetailsRenderer(
          (detail) => html`
            <vaadin-vertical-layout>
              ${this.metadata.columns.filter(c => c.detail).map(c =>
                  // @ts-ignore    
                  html`<div>${detail[c.id]}</div>`)}  
            </vaadin-vertical-layout>
          `,
          []
      )}>
        <vaadin-grid-selection-column></vaadin-grid-selection-column>

      ${this.metadata?.columns.filter(c => !c.detail).map(c => {
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
      
      ${this.count > this.pageSize?html`
      <vaadin-horizontal-layout style="align-items: baseline; width: 100%;" theme="spacing">
        <div style=" flex-grow: 1;">${this.message?this.message:`${this.count} elements found.`}</div>
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
      `:''}

      <vaadin-dialog
          header-title="Filters"
          .opened="${this.filtersOpened}"
          @opened-changed="${this.openedChangedForFilters}"
          ${dialogRenderer(() => html`

            <vaadin-vertical-layout theme="spacing">
              ${this.metadata?.searchForm.fields.slice(1).map(f => mapField(f, this.filterChanged, this.baseUrl, this.data))}
            </vaadin-vertical-layout>
          `, [])}
          ${dialogFooterRenderer(
              () => html`
                <vaadin-button theme="primary" @click="${this.clickedOnSearch}" style="margin-right: auto;" data-testid="dialog-confirm">
                  Search
                </vaadin-button>
                <vaadin-button theme="tertiary" @click="${this.closeFilters}" data-testid="dialog-cancel">Cancel</vaadin-button>
              `,
              []
          )}
      ></vaadin-dialog>


      <vaadin-dialog
          header-title="${this.confirmationTexts?.title}"
          .opened="${this.confirmationOpened}"
          @opened-changed="${this.openedChangedForConfirmation}"
          ${dialogRenderer(() => html`${this.confirmationTexts?.message}`, [])}
          ${dialogFooterRenderer(
              () => html`
                ${this.confirmationTexts?.action?html`
                  <vaadin-button theme="primary error" @click="${this.runConfirmedAction}" style="margin-right: auto;" data-testid="dialog-confirm">
                    ${this.confirmationTexts?.action}
                  </vaadin-button>
                `:''}
      
      <vaadin-button theme="${this.confirmationTexts?.action?'tertiary':'primary'}" @click="${this.closeConfirmation}" data-testid="dialog-cancel">${this.confirmationTexts?.action?'Cancel':'Ok. Got it'}</vaadin-button>
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
