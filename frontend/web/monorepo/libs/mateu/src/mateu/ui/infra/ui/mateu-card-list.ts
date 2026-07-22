import { customElement, property, query, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import { badge } from "@infra/ui/badgeStyles.ts";
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
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    @property()
    emptyStateMessage?: string


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

        var observer = new IntersectionObserver((entries) => {
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
            return renderClientSideComponent(this, item.card, this.baseUrl, this.state, this.data, this.appState, this.appData, false)
        }
        if (item.title) {
            return html`<div class="neutral-card">
                ${item.image?html`<img class="card-media" src="${item.image}" alt="" />`:nothing}
                <div class="card-body">
                    <div class="card-head">
                        ${item.title?html`<span class="card-title">${item.title}</span>`:nothing}
                        ${item.status?html`<span theme="badge ${getThemeForBadgetType(item.status.type)}">${item.status.message}</span>`:nothing}
                    </div>
                    ${item.subtitle?html`<div class="card-subtitle">${item.subtitle}</div>`:nothing}
                    ${item.content?html`<div>${item.content}</div>`:nothing}
                </div>
        </div>`
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
                <div id="ask-for-more" style="display: ${this.hasMore?'flex':'none'}; width: 100%; justify-content: center; padding: var(--lumo-space-m); color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s);">Loading more…</div>
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

        .neutral-card {
            display: flex;
            gap: .75rem;
            padding: .8rem 1rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, #fff);
            min-width: 14rem;
        }
        .neutral-card .card-media { width: 3rem; height: 3rem; object-fit: cover; border-radius: var(--lumo-border-radius-m, 8px); }
        .neutral-card .card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .2rem; }
        .neutral-card .card-head { display: flex; align-items: center; gap: .5rem; justify-content: space-between; }
        .neutral-card .card-title { font-weight: 600; }
        .neutral-card .card-subtitle { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-s, .875rem); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-card-list': MateuCardList
    }
}


