import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import AddOn from "@mateu/shared/apiClients/dtos/componentmetadata/AddOn";
import { formatMoney } from "@infra/ui/uxShared.ts";

/**
 * Priced extras picker with a live running total: a responsive card grid where each add-on shows an
 * icon chip, title, muted description and a monospace price line (or an "included" label with no
 * toggle). The +/✓ toggle flips the added state client-side (seeded from the wire `added` flags),
 * updates the header total and dispatches the component actionId with item, added flag and total.
 * DS-neutral, dark-mode aware.
 */
@customElement('mateu-addon-picker')
export class MateuAddonPicker extends LitElement {

    @property() totalLabel: string | undefined
    @property() currency: string | undefined
    @property() actionId: string | undefined
    @property({ type: Array }) items: AddOn[] = []

    @state() private added: Set<string> = new Set()

    static styles = css`
        :host { display: block; width: 100%; }
        .header { display: flex; align-items: baseline; justify-content: flex-end; gap: .4rem; margin-bottom: .6rem; }
        .total-label { font-size: var(--lumo-font-size-s, .875rem); color: var(--lumo-secondary-text-color, #888); }
        .total {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-m, 1rem); font-weight: 700;
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); gap: .7rem; }
        .card {
            position: relative;
            display: flex; flex-direction: column; align-items: flex-start; gap: .3rem;
            padding: .75rem .85rem; padding-right: 3rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, transparent);
            transition: border-color .15s ease, background .15s ease;
            min-width: 0;
        }
        .card.added {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.06));
        }
        .icon {
            font-size: 1.1rem; width: 2rem; height: 2rem;
            display: flex; align-items: center; justify-content: center;
            border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.04));
        }
        .title {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .price {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            color: var(--lumo-primary-text-color, #1a73e8);
            white-space: nowrap;
        }
        .included {
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            color: var(--lumo-success-text-color, #1a7f37);
            white-space: nowrap;
        }
        .toggle {
            position: absolute; top: .6rem; right: .6rem;
            width: 1.7rem; height: 1.7rem; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font: inherit; font-size: 1rem; line-height: 1; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            background: transparent; color: var(--lumo-secondary-text-color, #666);
            transition: all .15s ease;
        }
        .toggle:hover { border-color: var(--lumo-primary-color, #1a73e8); color: var(--lumo-primary-text-color, #1a73e8); }
        .toggle.on {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
        }
    `

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('items')) {
            this.added = new Set(this.items.filter(item => item.added).map(item => item.id!))
        }
    }

    private total(): number {
        return this.items
            .filter(item => item.id != undefined && this.added.has(item.id))
            .reduce((sum, item) => sum + (item.price ?? 0), 0)
    }

    private toggle(item: AddOn) {
        if (item.id == undefined) return
        const next = new Set(this.added)
        const nowAdded = !next.has(item.id)
        if (nowAdded) {
            next.add(item.id)
        } else {
            next.delete(item.id)
        }
        this.added = next
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId, parameters: { _item: item.id, _added: nowAdded, _total: this.total() } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="header">
                ${this.totalLabel ? html`<span class="total-label">${this.totalLabel}:</span>` : nothing}
                <span class="total">${formatMoney(this.total(), this.currency)}</span>
            </div>
            <div class="grid">
                ${this.items.map(item => {
                    const isAdded = item.id != undefined && this.added.has(item.id)
                    return html`
                        <div class="card ${isAdded ? 'added' : ''}">
                            ${item.icon ? html`<span class="icon">${item.icon}</span>` : nothing}
                            <span class="title">${item.title}</span>
                            ${item.description ? html`<span class="description">${item.description}</span>` : nothing}
                            ${item.includedLabel
                                ? html`<span class="included">${item.includedLabel}</span>`
                                : html`
                                    ${item.price != undefined ? html`
                                        <span class="price">${formatMoney(item.price, this.currency)}${item.unit ? ` / ${item.unit}` : ''}</span>
                                    ` : nothing}
                                    <button class="toggle ${isAdded ? 'on' : ''}" @click="${() => this.toggle(item)}"
                                            aria-pressed="${isAdded}">${isAdded ? '✓' : '+'}</button>
                                `}
                        </div>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-addon-picker": MateuAddonPicker
    }
}
