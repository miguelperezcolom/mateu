import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import StatusItem from "@mateu/shared/apiClients/dtos/componentmetadata/StatusItem";
import { chipStyles } from "@infra/ui/uxShared.ts";

/**
 * Bordered list of rows with an icon, a title + muted description, and on the right a status chip
 * (badge palette) and/or a small action button dispatching the item's actionId with the item id.
 * Used for incidents, side-effects checklists, etc. DS-neutral, dark-mode aware.
 */
@customElement('mateu-status-list')
export class MateuStatusList extends LitElement {

    @property({ type: Array }) items: StatusItem[] = []

    static styles = [chipStyles, css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .row { display: flex; align-items: center; gap: .8rem; padding: .65rem .9rem; }
        .row + .row { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .icon { font-size: 1.2rem; flex: 0 0 auto; }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
        .title {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        button {
            font: inherit; font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            padding: .25rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
            background: transparent; color: var(--lumo-primary-text-color, #1a73e8);
            cursor: pointer; white-space: nowrap; flex: 0 0 auto;
        }
        button:hover { background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1)); }
    `]

    private runAction(item: StatusItem) {
        if (!item.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: item.actionId, parameters: { _item: item.id } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="list">
                ${this.items.map(item => html`
                    <div class="row">
                        ${item.icon ? html`<span class="icon">${item.icon}</span>` : nothing}
                        <div class="body">
                            <span class="title">${item.title}</span>
                            ${item.description ? html`<span class="description">${item.description}</span>` : nothing}
                        </div>
                        ${item.status ? html`<span class="chip ${item.statusColor ?? ''}">${item.status}</span>` : nothing}
                        ${item.actionLabel && item.actionId
                            ? html`<button @click="${() => this.runAction(item)}">${item.actionLabel}</button>`
                            : nothing}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-status-list": MateuStatusList
    }
}
