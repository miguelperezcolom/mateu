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
import { GridDataProvider } from "@vaadin/grid/all-imports";
import { badge } from "@vaadin/vaadin-lumo-styles";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";
import { getThemeForBadgetType } from "@infra/ui/renderers/columnRenderers/statusColumnRenderer.ts";


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
        console.log('respondToVisibility', element, document.documentElement)
        var options = {
            root: document.documentElement,
        };

        var observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                console.log('observed', entry, entry.intersectionRatio, entry.isIntersecting)
                callback(entry.intersectionRatio > 0);
            });
        }, options);

        observer.observe(element);
    }

    @state()
    keepAsking = false

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.respondToVisibility(this.askForMore, (x:any) => {
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
            return renderClientSideComponent(this, item.card, this.baseUrl, this.state, this.data, false)
        }
        if (item.title) {
            return html`<vaadin-card
        >
                ${item.title?html`
                    <div slot="title">${item.title}</div>
                `:nothing}
                ${item.subtitle?html`
                    <div slot="subtitle">${item.subtitle}</div>
                `:nothing}
                ${item.content?html`
                    <div>${item.content}</div>
                `:nothing}
                ${item.status?html`
                    <span slot="header-suffix" theme="badge ${getThemeForBadgetType(item.status.type)}">${item.status.message}</span>
                `:nothing}
                ${item.image?html`
                    <img slot="media" src="${item.image}" alt="" />
                `:nothing}
                
        </vaadin-card>`
        }
        return html`${item}`
    }

    @query('#ask-for-more')
    askForMore: any

    @state()
    hasMore = false

    clickedOnCard = (item: any) => {
        this.state[this.id + '_selected_items'] = [item];
        if (this.metadata?.onRowSelectionChangedActionId) {
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: this.metadata?.onRowSelectionChangedActionId
                },
                bubbles: true,
                composed: true
            }))
        }
    }


    render():TemplateResult {

        const page = this.data[this.id]?.page
        return html`
            <div class="card-container">
                ${page?.content?.map((item:any) => html`<div @click="${() => this.clickedOnCard(item)}" class="car-container">${this.renderItem(item)}</div>`)}
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


