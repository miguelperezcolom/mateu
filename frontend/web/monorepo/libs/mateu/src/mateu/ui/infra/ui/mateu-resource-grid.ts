import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import ResourceItem from "@mateu/shared/apiClients/dtos/componentmetadata/ResourceItem";
import { chipStyles } from "@infra/ui/uxShared.ts";

/**
 * Availability/selection grid (e.g. room picker): cards with a big title, muted subtitle, a status
 * chip and an optional colored note. Disabled cards are dimmed and unclickable; the recommended one
 * gets an accent border and a floating mini-tag; clicking an enabled card selects it locally
 * (seeded from the wire `selected` flags) and dispatches the component actionId with the item id.
 * Fixed column count via `columns`, responsive auto-fill otherwise. DS-neutral, dark-mode aware.
 */
@customElement('mateu-resource-grid')
export class MateuResourceGrid extends LitElement {

    @property() actionId: string | undefined
    @property({ type: Number }) columns = 0
    @property() recommendedLabel: string | undefined
    @property({ type: Array }) items: ResourceItem[] = []

    @state() private selectedId: string | undefined

    static styles = [chipStyles, css`
        :host { display: block; width: 100%; }
        .grid { display: grid; gap: .7rem; }
        .cell {
            position: relative;
            display: flex; flex-direction: column; align-items: flex-start; gap: .3rem;
            padding: .75rem .85rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, transparent);
            transition: border-color .15s ease, background .15s ease;
            min-width: 0;
        }
        .cell:hover { border-color: var(--lumo-contrast-30pct, rgba(0,0,0,.25)); }
        .cell.disabled { opacity: .5; cursor: default; pointer-events: none; }
        .cell.recommended { border-color: var(--lumo-primary-color, #1a73e8); }
        .cell.selected {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.08));
        }
        .tag {
            position: absolute; top: -.6rem; left: .6rem;
            font-size: var(--lumo-font-size-xxs, .65rem); font-weight: 700; letter-spacing: .05em;
            padding: .05rem .45rem; border-radius: 999px;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
            white-space: nowrap;
        }
        .title {
            font-size: var(--lumo-font-size-l, 1.125rem); font-weight: 700;
            color: var(--lumo-body-text-color, #111);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .note {
            display: flex; align-items: center; gap: .3rem;
            font-size: var(--lumo-font-size-xs, .75rem);
            max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .note .dot { width: .45rem; height: .45rem; border-radius: 50%; flex: 0 0 auto; background: currentColor; }
        .note, .note.normal { color: var(--lumo-primary-text-color, #1a73e8); }
        .note.success { color: var(--lumo-success-text-color, #1a7f37); }
        .note.warning { color: var(--lumo-warning-text-color, #b45309); }
        .note.error { color: var(--lumo-error-text-color, #c5221f); }
        .note.contrast { color: var(--lumo-contrast-80pct, #333); }
    `]

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('items')) {
            this.selectedId = this.items.find(item => item.selected)?.id
        }
    }

    private select(item: ResourceItem) {
        if (item.disabled) return
        this.selectedId = item.id
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId, parameters: { _item: item.id } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const gridStyle = this.columns > 0
            ? `grid-template-columns: repeat(${this.columns}, minmax(0, 1fr));`
            : 'grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));'
        return html`
            <div class="grid" style="${gridStyle}">
                ${this.items.map(item => html`
                    <div class="cell ${item.disabled ? 'disabled' : ''} ${item.recommended ? 'recommended' : ''} ${item.id === this.selectedId ? 'selected' : ''}"
                         @click="${() => this.select(item)}">
                        ${item.recommended ? html`<span class="tag">${this.recommendedLabel || 'Recommended'}</span>` : nothing}
                        <span class="title">${item.title}</span>
                        ${item.subtitle ? html`<span class="subtitle">${item.subtitle}</span>` : nothing}
                        ${item.statusLabel ? html`<span class="chip ${item.statusColor ?? ''}">${item.statusLabel}</span>` : nothing}
                        ${item.note ? html`<span class="note ${item.noteColor ?? ''}"><span class="dot"></span>${item.note}</span>` : nothing}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-resource-grid": MateuResourceGrid
    }
}
