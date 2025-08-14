import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
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

interface Page {
    pageNumber: number
    text: string
    clickable: boolean
}


@customElement('mateu-pagination')
export class MateuPagination extends LitElement {

    @property()
    totalElements = 0

    @property()
    pageSize = 100

    @property()
    pageNumber = 0

    @state()
    pages: Page[] = []

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has("totalElements") || _changedProperties.has("pageNumber")) {
            const pages:Page[] = []
            const totalPages = Math.ceil(this.totalElements / this.pageSize);
            const lastPage = totalPages - 1
            if (this.totalElements > 0) {
                if (this.pageNumber > 0) {
                    pages.push({pageNumber: 0, text: 'first', clickable: true})
                }
                if (this.pageNumber > 1) {
                    pages.push({pageNumber: this.pageNumber - 1, text: 'prev', clickable: true})
                }
                pages.push({pageNumber: this.pageNumber, text: `${this.pageNumber}`, clickable: false})
                if (this.pageNumber < lastPage - 1) {
                    const whichPage:number = +this.pageNumber + 1;
                    pages.push({pageNumber: whichPage, text: 'next', clickable: true})
                }
                if (this.pageNumber < lastPage) {
                    pages.push({pageNumber: lastPage, text: 'last', clickable: true})
                }
            }
            this.pages = pages;
        }
    }

    clickOnPage(event: Event) {
        const page = (event.target as HTMLElement).getAttribute('page');
        this.dispatchEvent(new CustomEvent('page-changed', {
            bubbles: true,
            composed: true,
            detail: {
                page
            }
        }))
    }

    render() {
        return this.totalElements?html`
            <div class="paginator">
                ${this.pages.length < 1 || this.totalElements <= this.pageSize?html``:html`
          Page:
          ${this.pages.map(p => p.clickable?html`
          <vaadin-button theme="tertiary" @click=${this.clickOnPage} page=${p.pageNumber} data-testid="page-${p.pageNumber}">${p.text}</vaadin-button>
        `:html` [ ${p.text} ] `)}
        `}
            <slot></slot>
            </div>
       `:nothing
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-pagination': MateuPagination
    }
}


