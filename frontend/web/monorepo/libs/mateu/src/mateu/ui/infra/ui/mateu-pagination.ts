import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/icon'
import '@vaadin/icons'

@customElement('mateu-pagination')
export class MateuPagination extends LitElement {

    @property()
    totalElements = 0

    @property()
    pageSize = 100

    @property()
    pageNumber = 0

    @state()
    totalPages = 0

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has("totalElements") || _changedProperties.has("pageSize")) {
            this.totalPages = Math.ceil(this.totalElements / this.pageSize)
        }
    }

    dispatch(page: number) {
        this.dispatchEvent(new CustomEvent('page-changed', {
            bubbles: true,
            composed: true,
            detail: { page }
        }))
    }

    render() {
        if (!this.totalElements) return nothing
        const multiPage = this.totalPages > 1
        const currentPage = this.pageNumber  // 0-indexed internally
        const isFirst = currentPage === 0
        const isLast = currentPage >= this.totalPages - 1

        return html`
            <vaadin-horizontal-layout theme="spacing" style="align-items: center; flex-wrap: wrap;">
                ${multiPage ? html`
                    <vaadin-button theme="tertiary icon" title="First page" ?disabled="${isFirst}"
                        @click="${() => this.dispatch(0)}" data-testid="page-first">
                        <vaadin-icon icon="vaadin:angle-double-left"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Previous page" ?disabled="${isFirst}"
                        @click="${() => this.dispatch(currentPage - 1)}" data-testid="page-prev">
                        <vaadin-icon icon="vaadin:angle-left"></vaadin-icon>
                    </vaadin-button>
                    <span class="page-indicator">Page ${currentPage + 1} of ${this.totalPages}</span>
                    <vaadin-button theme="tertiary icon" title="Next page" ?disabled="${isLast}"
                        @click="${() => this.dispatch(currentPage + 1)}" data-testid="page-next">
                        <vaadin-icon icon="vaadin:angle-right"></vaadin-icon>
                    </vaadin-button>
                    <vaadin-button theme="tertiary icon" title="Last page" ?disabled="${isLast}"
                        @click="${() => this.dispatch(this.totalPages - 1)}" data-testid="page-last">
                        <vaadin-icon icon="vaadin:angle-double-right"></vaadin-icon>
                    </vaadin-button>
                    <span class="separator"></span>
                ` : nothing}
                <span class="total-count">${this.totalElements} item${this.totalElements === 1 ? '' : 's'}</span>
                <slot></slot>
            </vaadin-horizontal-layout>
        `
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .page-indicator {
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
            white-space: nowrap;
        }
        .total-count {
            font-size: var(--lumo-font-size-s);
            color: var(--lumo-secondary-text-color);
            white-space: nowrap;
        }
        .separator {
            display: inline-block;
            width: 1px;
            height: 1.2rem;
            background-color: var(--lumo-contrast-20pct);
            align-self: center;
            margin: 0 4px;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-pagination': MateuPagination
    }
}
