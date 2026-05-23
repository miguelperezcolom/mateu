import { customElement, property, state } from "lit/decorators.js";
import { html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";

interface Page {
    pageNumber: number
    text: string
    clickable: boolean
}

@customElement('mateu-sapui5-pagination')
export class MateuSapUI5Pagination extends LitElement {

    @property({ type: Number }) totalElements = 0
    @property({ type: Number }) pageSize = 100
    @property({ type: Number }) pageNumber = 0

    @state() private pages: Page[] = []

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties)
        if (_changedProperties.has('totalElements') || _changedProperties.has('pageNumber') || _changedProperties.has('pageSize')) {
            const pages: Page[] = []
            const totalPages = Math.ceil(this.totalElements / this.pageSize)
            const lastPage = totalPages - 1
            if (this.totalElements > 0) {
                if (this.pageNumber > 0)
                    pages.push({ pageNumber: 0, text: '«', clickable: true })
                if (this.pageNumber > 1)
                    pages.push({ pageNumber: this.pageNumber - 1, text: '‹', clickable: true })
                pages.push({ pageNumber: this.pageNumber, text: `${this.pageNumber + 1}`, clickable: false })
                if (this.pageNumber < lastPage - 1)
                    pages.push({ pageNumber: this.pageNumber + 1, text: '›', clickable: true })
                if (this.pageNumber < lastPage)
                    pages.push({ pageNumber: lastPage, text: '»', clickable: true })
            }
            this.pages = pages
        }
    }

    private goToPage(pageNumber: number) {
        this.dispatchEvent(new CustomEvent('page-changed', {
            bubbles: true, composed: true,
            detail: { page: pageNumber }
        }))
    }

    render(): TemplateResult {
        if (!this.totalElements) return html``
        return html`
            <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                ${this.pages.length >= 2 && this.totalElements > this.pageSize ? html`
                    <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; margin-right: 0.25rem;">Page:</span>
                    ${this.pages.map(p => p.clickable
                        ? html`<ui5-button design="Transparent" @click="${() => this.goToPage(p.pageNumber)}">${p.text}</ui5-button>`
                        : html`<ui5-button design="Default" ?disabled="${true}">${p.text}</ui5-button>`
                    )}
                    <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; margin-left: 0.5rem;">|</span>
                ` : nothing}
                <span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem;">
                    Total: <strong>${this.totalElements}</strong>
                </span>
                <slot></slot>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-sapui5-pagination': MateuSapUI5Pagination
    }
}
