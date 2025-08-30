import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import "@vaadin/tooltip"
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-filter-column.js';
import '@vaadin/grid/vaadin-grid-selection-column.js';
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import { GridSortColumnDirectionChangedEvent } from "@vaadin/grid/src/vaadin-grid-sort-column-mixin";
import { GridDataProvider, GridSortColumn } from "@vaadin/grid/all-imports";
import { badge } from "@vaadin/vaadin-lumo-styles";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";


const directionChanged = (event: GridSortColumnDirectionChangedEvent) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget?.dispatchEvent(new CustomEvent('sort-direction-changed', {
        detail: {
            grid: (event.currentTarget as GridSortColumn).parentElement
        },
        bubbles: true,
        composed: true
    }))
}


@customElement('mateu-card-list')
export class MateuCardList extends LitElement {


    @property()
    id: string = ''

    @property()
    metadata: Table | undefined

    @property()
    baseUrl: string = ''

    @property()
    state: Record<string, any> = {}

    @property()
    data: Record<string, any> = {}

    @property()
    emptyStateMessage?: string


    // @ts-ignore
    dataProvider:GridDataProvider<unknown> = (params, callback) => {
        const page = this.data[this.id]?.page
        callback(page?.content??[], page?.content?.length??0);
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        //this.grid?.clearCache()
        const page = this.data[this.id]?.page
        this.hasMore = page?.content?.length < page?.totalElements
    }

    respondToVisibility = (element: HTMLElement, callback: any) => {
        var options = {
            root: document.documentElement,
        };

        var observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                callback(entry.intersectionRatio > 0);
            });
        }, options);

        observer.observe(element);
    }

    @state()
    keepAsking = false

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.respondToVisibility(this.askForMore, x => {
            this.keepAsking = x
            if (x) {
                this.askToUpper()
            }
        })
    }

    askToUpper = () => {
        const page = this.data[this.id]?.page
        const nextPageNumber = page?.content?.length / page?.pageSize
        this.dispatchEvent(new CustomEvent('fetch-more-elements', {
            detail: {
                params: {
                    page: nextPageNumber,
                    pageSize: this.metadata?.pageSize
                },
                callback: () => {
                    if (this.keepAsking) {
                        this.askToUpper()
                    }
                }
            },
            bubbles: true,
            composed: true
        }))

    }

    renderItem = (item: any) => {
        if (item.card) {
            return renderClientSideComponent(this, item.card, this.baseUrl, this.state, this.data)
        }
        return html`${item}`
    }

    @query('#ask-for-more')
    askForMore: any

    @state()
    hasMore = false


    render():TemplateResult {

        const page = this.data[this.id]?.page
        const hasMore = this.metadata?.infiniteScrolling
        console.log('page', page, hasMore)
        return html`
            <div class="card-container">
                ${page?.content?.map(item => this.renderItem(item))}
                <div id="ask-for-more" style="display: ${this.hasMore?'':'none'};">xx</div>
            </div>

            <slot></slot>
       `
    }

    static styles = css`
        ${badge}
        
        .card-container {
            display: flex; 
            width: 100%; 
            flex-wrap: wrap; 
            gap: 10px;
        }

        vaadin-card.image-on-right::part(media) {
            grid-column: 3;
        }

    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-card-list': MateuCardList
    }
}


