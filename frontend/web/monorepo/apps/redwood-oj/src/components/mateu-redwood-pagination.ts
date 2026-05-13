import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";

interface Page {
    pageNumber: number
    text: string
    clickable: boolean
}

@customElement('mateu-redwood-pagination')
export class MateuRedwoodPagination extends LitElement {

    @property({ type: Number })
    totalElements = 0

    @property({ type: Number })
    pageSize = 100

    @property({ type: Number })
    pageNumber = 0

    @state()
    private pages: Page[] = []

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties)
        if (_changedProperties.has('totalElements') || _changedProperties.has('pageNumber') || _changedProperties.has('pageSize')) {
            const pages: Page[] = []
            const totalPages = Math.ceil(this.totalElements / this.pageSize)
            const lastPage = totalPages - 1
            if (this.totalElements > 0) {
                if (this.pageNumber > 0) {
                    pages.push({ pageNumber: 0, text: 'First', clickable: true })
                }
                if (this.pageNumber > 1) {
                    pages.push({ pageNumber: this.pageNumber - 1, text: 'Prev', clickable: true })
                }
                pages.push({ pageNumber: this.pageNumber, text: `${this.pageNumber}`, clickable: false })
                if (this.pageNumber < lastPage - 1) {
                    pages.push({ pageNumber: parseInt('' + this.pageNumber) + 1, text: 'Next', clickable: true })
                }
                if (this.pageNumber < lastPage) {
                    pages.push({ pageNumber: lastPage, text: 'Last', clickable: true })
                }
            }
            this.pages = pages
        }
    }

    private goToPage(pageNumber: number) {
        this.dispatchEvent(new CustomEvent('page-changed', {
            bubbles: true,
            composed: true,
            detail: { page: pageNumber }
        }))
    }

    render(): TemplateResult {
        if (!this.totalElements) return html`${nothing}`
        return html`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0;">
                ${this.pages.length < 2 || this.totalElements <= this.pageSize ? nothing : html`
                    <span>Page:</span>
                    ${this.pages.map(p => p.clickable ? html`
                        <oj-c-button
                            data-oj-binding-provider="preact"
                            label="${p.text}"
                            chroming="borderless"
                            @ojAction="${() => this.goToPage(p.pageNumber)}"
                        ></oj-c-button>
                    ` : html`<span>[ ${p.text} ]</span>`)}
                `}
                <span>Total elements: ${this.totalElements}</span>
                <slot></slot>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redwood-pagination': MateuRedwoodPagination
    }
}
