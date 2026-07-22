import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import StatusItem from "@mateu/shared/apiClients/dtos/componentmetadata/StatusItem";
import { chipStyles } from "@infra/ui/uxShared.ts";

/**
 * Bordered list of rows with an icon (or a circular initials avatar), a title + muted description,
 * and on the right a status chip (badge palette) and/or a small action button dispatching the
 * item's actionId with the item id. Used for incidents, side-effects checklists, etc. `compact`
 * tightens the row padding for dense screens. DS-neutral, dark-mode aware.
 */
@customElement('mateu-status-list')
export class MateuStatusList extends LitElement {

    @property({ type: Array }) items: StatusItem[] = []
    @property({ type: Boolean }) compact = false
    /** divider lines between rows but no outer border (the host provides the framing) */
    @property({ type: Boolean }) frameless = false
    /** makes every row clickable: clicking one dispatches this action with { _item: id } */
    @property() rowActionId: string | undefined

    static styles = [chipStyles, css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
            /* an ancestor (e.g. a form-layout row) may set an inherited line-height like 44px —
               it pierces the shadow boundary and blows the rows up */
            line-height: var(--lumo-line-height-s, 1.375);
        }
        .list.frameless { border: none; border-radius: 0; }
        .row { display: flex; align-items: center; gap: .8rem; padding: .65rem .9rem; }
        .list.compact .row { gap: .6rem; padding: .35rem .75rem; }
        .row.clickable { cursor: pointer; }
        .row.clickable:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
        /* no frame → align the content with the host's edges */
        .list.frameless .row { padding-left: 0; padding-right: 0; }
        .row + .row { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .icon { font-size: 1.2rem; flex: 0 0 auto; }
        .avatar {
            flex: 0 0 auto;
            width: 2rem; height: 2rem;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            letter-spacing: .02em;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .list.compact .avatar { width: 1.6rem; height: 1.6rem; font-size: .65rem; }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
        .list.compact .body { gap: 0; }
        .title {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .description {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        /* DS-neutral small action button */
        .row-action {
            flex: 0 0 auto;
            font: inherit; font-weight: 600;
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: .25rem .7rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2));
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-text-color, #1a73e8);
            cursor: pointer;
        }
        .row-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `]

    private runAction(item: StatusItem) {
        if (!item.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: item.actionId, parameters: { _item: item.id } },
            bubbles: true,
            composed: true
        }))
    }

    private rowClicked(item: StatusItem) {
        if (!this.rowActionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.rowActionId, parameters: { _item: item.id } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="list ${this.compact ? 'compact' : ''} ${this.frameless ? 'frameless' : ''}">
                ${this.items.map(item => html`
                    <div class="row ${this.rowActionId ? 'clickable' : ''}"
                         @click="${() => this.rowClicked(item)}">
                        ${item.avatar
                            ? html`<span class="avatar">${item.avatar}</span>`
                            : item.icon ? html`<span class="icon">${item.icon}</span>` : nothing}
                        <div class="body">
                            <span class="title">${item.title}</span>
                            ${item.description ? html`<span class="description">${item.description}</span>` : nothing}
                        </div>
                        ${item.status ? html`<span class="chip ${item.statusColor ?? ''}">${item.status}</span>` : nothing}
                        ${item.actionLabel && item.actionId
                            ? html`<button class="row-action" @click="${() => this.runAction(item)}">${item.actionLabel}</button>`
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
