import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import StatusItem from "@mateu/shared/apiClients/dtos/componentmetadata/StatusItem";
import { chipStyles } from "@infra/ui/uxShared.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

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
    /** N-column responsive grid instead of a single stack; 0 = classic one-column list */
    @property({ type: Number }) columns = 0
    /** heading level of item titles in stacked mode (3 → h3, 4 → h4 under an h3 group) */
    @property({ type: Number }) itemHeadingLevel = 3

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
        /* N-column grid mode (columns > 1): cells instead of stacked rows — no dividers,
           auto-collapsing to one column on narrow viewports via the min() clamp */
        .list.grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(18rem, 100%), 1fr));
            /* air BETWEEN cards (the operations checklist reads as a grid of fichas, not a
               dense list) — overridable per surface via the CSS vars */
            column-gap: var(--mateu-status-grid-column-gap, 2.5rem);
            row-gap: var(--mateu-status-grid-row-gap, 2rem);
        }
        .list.grid .cell { padding: .6rem 0; }
        .list.grid .row + .row { border-top: none; }
        /* STACKED cells (items with actions or a timeline): borderless card — title + status
           chip on the same line, description below, icon actions below. Mirrors the VB/Redwood
           check-in anatomy (pax fichas / operations checklist). */
        .list.stacked { border: none; border-radius: 0; overflow: visible; }
        .cell { display: flex; flex-direction: column; gap: .2rem; padding: .5rem 0; }
        .cell + .cell { border-top: none; }
        .list.stacked:not(.grid) .cell + .cell { margin-top: .6rem; }
        /* a single-column stack (e.g. the guests rail) keeps card-sized cells — same width
           as the operations grid cells, however wide the hosting fold grows */
        .list.stacked:not(.grid) .cell { max-width: 22rem; }
        .cell-title-row { display: flex; align-items: center; gap: .5rem; min-width: 0; }
        .cell-title {
            margin: 0; font-weight: 600; color: var(--lumo-body-text-color, #222);
            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        h3.cell-title { font-size: var(--lumo-font-size-m, 1rem); }
        h4.cell-title { font-size: var(--lumo-font-size-s, .875rem); }
        /* the status chip aligns to the RIGHT edge of the card */
        .cell-title-row .chip { margin-left: auto; }
        .cell-description {
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
        }
        .cell-line {
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
        }
        .cell-actions { display: flex; gap: .35rem; padding-top: .25rem; }
        .icon-action {
            display: inline-flex; align-items: center; justify-content: center;
            width: 2rem; height: 2rem;
            border: none; border-radius: var(--lumo-border-radius-m, 6px);
            background: transparent;
            color: var(--lumo-primary-text-color, #1a73e8);
            cursor: pointer; font-size: 1rem;
        }
        .icon-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `]

    private runAction(item: StatusItem, actionId?: string) {
        if (!actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: { _item: item.id } },
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

    /** one of the item's up-to-three actions, as an ICON button (label = tooltip) when it
     *  carries an icon, or the classic small text button otherwise */
    private renderItemAction(item: StatusItem, label?: string, actionId?: string, iconName?: string) {
        if (!label || !actionId) return nothing
        if (iconName) {
            return html`
                <button class="icon-action" title="${label}" aria-label="${label}"
                    @click="${(e: Event) => { e.stopPropagation(); this.runAction(item, actionId) }}">
                    ${icon(iconName)}
                </button>`
        }
        return html`
            <button class="row-action" title="${label}"
                @click="${(e: Event) => { e.stopPropagation(); this.runAction(item, actionId) }}">${label}</button>`
    }

    render() {
        // STACKED mode (the VB/Redwood check-in anatomy): items carrying their own actions or a
        // timeline render as borderless cards — title + chip on one line, description below,
        // icon actions below. Plain status rows (and rowActionId listings) keep the classic row.
        const stacked = this.columns > 1
            || this.items.some(item => item.actionId || item.actionId2 || item.actionId3 || (item.lines?.length ?? 0) > 0)
        const heading = this.itemHeadingLevel === 4 ? 'h4' : 'h3'
        if (stacked) {
            return html`
                <div class="list stacked ${this.compact ? 'compact' : ''} ${this.columns > 1 ? 'grid' : ''}"
                     style="${this.columns > 1 ? `grid-template-columns: repeat(auto-fit, minmax(min(18rem, calc(100% / ${this.columns} - 1.5rem)), 1fr));` : ''}">
                    ${this.items.map(item => html`
                        <div class="cell ${(item.lines?.length ?? 0) > 0 ? 'with-lines' : ''} ${this.rowActionId ? 'clickable' : ''}"
                             @click="${() => this.rowClicked(item)}">
                            <div class="cell-title-row">
                                ${heading === 'h4'
                                    ? html`<h4 class="cell-title">${item.title}</h4>`
                                    : html`<h3 class="cell-title">${item.title}</h3>`}
                                ${item.status ? html`<span class="chip ${item.statusColor ?? ''}">${item.status}</span>` : nothing}
                            </div>
                            ${item.description ? html`<span class="cell-description">${item.description}</span>` : nothing}
                            ${(item.lines ?? []).map(line => html`<span class="cell-line">${line}</span>`)}
                            ${(item.actionId || item.actionId2 || item.actionId3) ? html`
                                <div class="cell-actions">
                                    ${this.renderItemAction(item, item.actionLabel, item.actionId, item.actionIcon)}
                                    ${this.renderItemAction(item, item.actionLabel2, item.actionId2, item.actionIcon2)}
                                    ${this.renderItemAction(item, item.actionLabel3, item.actionId3, item.actionIcon3)}
                                </div>` : nothing}
                        </div>
                    `)}
                </div>
            `
        }
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
