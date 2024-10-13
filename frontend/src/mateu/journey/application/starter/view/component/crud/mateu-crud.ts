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
import {CrudState} from "./crudstate";
import {Subject, Subscription} from "rxjs";
import {CrudService} from "./crudservice";
import Action from "../../../../../../shared/apiClients/dtos/Action";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import {ActionTarget} from "../../../../../../shared/apiClients/dtos/ActionTarget";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import Form from "../../../../../../shared/apiClients/dtos/Form";


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
  searchText: string | undefined;

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

  @property()
  selectedItems:any[] = []

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
    searchText: '',
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
      searchText: this.searchText,
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
    searchText: string | undefined
    filters: object
    sortOrders: string
  }) {
      this.state.uiId = this.uiId
      this.state.journeyTypeId = this.journeyTypeId
      this.state.journeyId = this.journeyId
      this.state.stepId = this.stepId
      this.state.listId = this.component.id
      this.state.searchText = params.searchText
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

  searchTextChanged(e:CustomEvent) {
    const input = e.target as HTMLInputElement;
    this.searchText = input.value
  }


  filterChanged(e:CustomEvent) {
    console.log('e.detail.data', e.detail.data)
    this.data = { ...e.detail.data}
  }

  updateFiltersText() {
    let text = this.searchText?this.searchText:'';
    const filterFields = (this.metadata?.searchForm.metadata as Form).sections
        .flatMap(s => s.fieldGroups)
        .flatMap(g => g.lines)
        .flatMap(l => l.fields)
    filterFields.forEach(f => {
      if (this.data[f.id]) {
        if (f.id != 'action') {
          if (text) text += ', ';
          text += this.data[f.id];
        }
      }
    })
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
            </vaadin-grid-sort-column>
          `;
    }
    if (c.type == 'ColumnActionGroup') {
      return html`
        <vaadin-grid-column  path="${c.id}" data-testid="column-${c.id}" header="${c.caption}" width="90px" flex-grow="0"
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
                                     width="${ifDefined(c.width?c.width:'50px')}"
                                     flex-grow="${ifDefined(c.width?'0':'1')}"
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

  hasDetail() {
    return this.metadata.columns.find(c => c.detail);
  }


  exportItemSelected(event: MenuBarItemSelectedEvent) {
    let item = event.detail.value
    if (item.text == 'Excel') {
      mateuApiClient.getXls(this.uiId, this.journeyTypeId, this.journeyId, this.stepId, this.component.id, this.getSortOrders(), this.searchText, this.data)
    } else if (item.text == 'Csv') {
      mateuApiClient.getCsv(this.uiId, this.journeyTypeId, this.journeyId, this.stepId, this.component.id, this.getSortOrders(), this.searchText, this.data)
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
        ${!this.metadata?.searchable && !((this.metadata?.searchForm.metadata as Form).sections && (this.metadata?.searchForm.metadata as Form).sections.length > 0)?html`
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
      ${this.metadata?.searchable || ((this.metadata?.searchForm.metadata as Form).sections && (this.metadata?.searchForm.metadata as Form).sections.length > 0)?html`
        <vaadin-horizontal-layout style="align-items: baseline;" theme="spacing">
          ${this.metadata?.searchable?html`
            <vaadin-text-field id="searchText"
                               data-testid="searchText"
                               placeholder="Search"
                               value="${this.searchText}"
                               @change="${this.searchTextChanged}"
                               style="flex-grow: 1;" autofocus="true"
                               autoselect="on"></vaadin-text-field>
            <vaadin-button theme="primary" @click="${this.clickedOnSearch}" data-testid="search">Search</vaadin-button>
          `:''}
          ${(this.metadata?.searchForm.metadata as Form).sections && (this.metadata?.searchForm.metadata as Form).sections.length > 0?html`
            <vaadin-button theme="secondary" @click="${this.clickedOnFilters}" data-testid="filters">Filters</vaadin-button>
            <vaadin-button theme="secondary" @click="${this.clickedOnClearFilters}" data-testid="clearfilters">Clear filters</vaadin-button>
          `:''}
        </vaadin-horizontal-layout>
        <p style="margin-block-start: 0;">${this.filtersText}</p>
      `:''}

      <vaadin-grid id="grid-${this.component.id}" .items="${this.items}" all-rows-visible
                   .detailsOpenedItems="${this.detailsOpenedItem}"
                   .selectedItems="${this.selectedItems}"
                   @active-item-changed="${ifDefined(this.metadata.selectionListened || this.metadata.hasActionOnSelectedRow || this.hasDetail()?(event: GridActiveItemChangedEvent<any>) => {
                     //this.detailsOpenedItem = [event.detail.value]
                     if (this.metadata.selectionListened || this.metadata.hasActionOnSelectedRow) {
                       const item = event.detail.value;
                       this.selectedItems = item ? [item] : [];
                        if (this.metadata.selectionListened && item) {
                          this.askForActionRun("__itemSelected", item);
                        }                       
                     }
                     if (this.hasDetail() && this.metadata.columns.filter(c => c.detail)) {
                       const row = event.detail.value
                       if (row) {
                         this.detailsOpenedItem = [row]
                       } else {
                         this.detailsOpenedItem = []
                       }
                     }
                   }:undefined)}"
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
        ${this.metadata.multipleRowSelectionEnabled?html`<vaadin-grid-selection-column></vaadin-grid-selection-column>`:''}

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
                <mateu-form
                            .component=${(this.metadata?.searchForm.metadata as Form)}
                            .components=${[]}
                            .metadata=${(this.metadata?.searchForm.metadata as Form)} 
                            .data=${this.metadata?.searchForm.data}
                            journeyTypeId="${this.journeyTypeId}"
                            journeyId="${this.journeyId}" 
                            stepId="${this.stepId}"
                            componentId="${this.metadata?.searchForm.id}"
                            .rules=${(this.metadata?.searchForm.metadata as Form).rules}
                            .service=${this.crudService}
                            baseUrl="${this.baseUrl}"
                            previousStepId="${this.previousStepId}"
                            @data-changed="${this.filterChanged}"
                    ><slot></slot></mateu-form>            
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
