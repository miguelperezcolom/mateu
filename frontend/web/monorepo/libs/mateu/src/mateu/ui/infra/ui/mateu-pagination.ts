import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, PropertyValues } from "lit";

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
            <div class="bar">
                ${multiPage ? html`
                    <button class="nav" title="First page" ?disabled="${isFirst}"
                        @click="${() => this.dispatch(0)}" data-testid="page-first">«</button>
                    <button class="nav" title="Previous page" ?disabled="${isFirst}"
                        @click="${() => this.dispatch(currentPage - 1)}" data-testid="page-prev">‹</button>
                    <span class="page-indicator">Page ${currentPage + 1} of ${this.totalPages}</span>
                    <button class="nav" title="Next page" ?disabled="${isLast}"
                        @click="${() => this.dispatch(currentPage + 1)}" data-testid="page-next">›</button>
                    <button class="nav" title="Last page" ?disabled="${isLast}"
                        @click="${() => this.dispatch(this.totalPages - 1)}" data-testid="page-last">»</button>
                    <span class="separator"></span>
                ` : nothing}
                <span class="total-count">${this.totalElements} item${this.totalElements === 1 ? '' : 's'}</span>
                <slot></slot>
            </div>
        `
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .bar {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: var(--lumo-space-s, 0.5rem);
        }
        /* tertiary icon button, DS-neutral */
        .nav {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 2rem;
            height: 2rem;
            padding: 0 0.35rem;
            border: none;
            background: transparent;
            color: var(--lumo-primary-text-color, #1a73e8);
            font-size: 1.1rem;
            line-height: 1;
            border-radius: var(--lumo-border-radius-m, 6px);
            cursor: pointer;
        }
        .nav:hover:not(:disabled) { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .nav:disabled { color: var(--lumo-disabled-text-color, #bbb); cursor: default; }
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
