import { css, html, LitElement } from "lit";
import { customElement, property } from 'lit/decorators.js';
import LedgerLine from "@mateu/shared/apiClients/dtos/componentmetadata/LedgerLine";
import { formatMoney } from "@infra/ui/uxShared.ts";

/**
 * Folio/ledger breakdown: dot-bulleted concept rows with right-aligned monospace amounts (negative
 * ones in error red, included ones showing a muted label instead), a divider and a big total. When
 * the wire total is absent the client sums the non-included amounts. Read-only. DS-neutral,
 * dark-mode aware.
 */
@customElement('mateu-ledger')
export class MateuLedger extends LitElement {

    @property() currency: string | undefined
    @property() totalLabel: string | undefined
    @property({ type: Array }) lines: LedgerLine[] = []
    @property({ type: Number }) total: number | undefined

    static styles = css`
        :host {
            display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem);
            /* an ancestor (e.g. a form-layout row) may set an inherited line-height like 44px —
               it pierces the shadow boundary and blows the rows up */
            line-height: var(--lumo-line-height-s, 1.375);
        }
        .row { display: flex; align-items: center; gap: .6rem; padding: .35rem 0; }
        .dot {
            width: .35rem; height: .35rem; border-radius: 50%; flex: 0 0 auto;
            background: var(--lumo-contrast-30pct, rgba(0,0,0,.25));
        }
        .concept {
            flex: 1; min-width: 0; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .amount {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-variant-numeric: tabular-nums;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap;
        }
        .amount.negative { color: var(--lumo-error-text-color, #c5221f); }
        .included-label { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); white-space: nowrap; }
        .total-row {
            display: flex; align-items: baseline; justify-content: space-between; gap: .6rem;
            margin-top: .45rem; padding-top: .55rem;
            border-top: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
        }
        .total-label { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .total {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-variant-numeric: tabular-nums;
            font-size: var(--lumo-font-size-l, 1.125rem); font-weight: 700;
            color: var(--lumo-body-text-color, #111);
            white-space: nowrap;
        }
    `

    private computedTotal(): number {
        if (this.total != undefined) {
            return this.total
        }
        return this.lines
            .filter(line => !line.included)
            .reduce((sum, line) => sum + (line.amount ?? 0), 0)
    }

    render() {
        return html`
            ${this.lines.map(line => html`
                <div class="row">
                    <span class="dot"></span>
                    <span class="concept">${line.concept}</span>
                    ${line.included
                        ? html`<span class="included-label">${line.includedLabel || 'Included'}</span>`
                        : html`<span class="amount ${(line.amount ?? 0) < 0 ? 'negative' : ''}">${formatMoney(line.amount ?? 0, this.currency)}</span>`}
                </div>
            `)}
            <div class="total-row">
                <span class="total-label">${this.totalLabel || 'Total'}</span>
                <span class="total">${formatMoney(this.computedTotal(), this.currency)}</span>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-ledger": MateuLedger
    }
}
