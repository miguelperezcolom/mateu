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

    @state()
    private summary = ''

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties)
        if (_changedProperties.has('totalElements') || _changedProperties.has('pageNumber') || _changedProperties.has('pageSize')) {
            const pages: Page[] = []
            const totalPages = Math.max(1, Math.ceil(this.totalElements / this.pageSize))
            const lastPage = totalPages - 1
            if (this.totalElements > 0) {
                if (this.pageNumber > 0) {
                    pages.push({ pageNumber: 0, text: 'First', clickable: true })
                    pages.push({ pageNumber: this.pageNumber - 1, text: 'Prev', clickable: true })
                }
                pages.push({ pageNumber: this.pageNumber, text: `Page ${this.pageNumber + 1} of ${totalPages}`, clickable: false })
                if (this.pageNumber < lastPage) {
                    pages.push({ pageNumber: this.pageNumber + 1, text: 'Next', clickable: true })
                    pages.push({ pageNumber: lastPage, text: 'Last', clickable: true })
                }
            }
            this.pages = pages
            this.summary = this.totalElements === 1 ? '1 item' : `${this.totalElements} items`
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
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0; font-size: 0.86rem; color: var(--oj-core-text-color-secondary, #5a5750);">
                ${this.totalElements <= this.pageSize ? nothing : html`
                    ${this.pages.map(p => p.clickable ? html`
                        <oj-c-button
                            data-oj-binding-provider="preact"
                            label="${p.text}"
                            chroming="borderless"
                            @ojAction="${() => this.goToPage(p.pageNumber)}"
                        ></oj-c-button>
                    ` : html`<span style="font-weight: 600; color: var(--oj-core-text-color-primary, #161513);">${p.text}</span>`)}
                    <span aria-hidden="true" style="opacity: 0.4;">·</span>
                `}
                <span>${this.summary}</span>
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
