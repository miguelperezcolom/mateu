import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import KanbanColumn from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanColumn";
import KanbanCard from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanCard";

/**
 * Dependency-free kanban board: horizontally scrolling columns, each with a header (title + count)
 * and a stack of cards. A card with an actionId is clickable and dispatches the standard
 * action-requested event. Design-system neutral (Lumo CSS vars + fallbacks), dark-mode aware.
 */
@customElement('mateu-kanban')
export class MateuKanban extends LitElement {

    @property({ type: Array })
    columns: KanbanColumn[] = []

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .board {
            display: flex;
            gap: var(--lumo-space-m, 1rem);
            align-items: flex-start;
            overflow-x: auto;
            padding-bottom: .5rem;
        }
        .column {
            flex: 0 0 16rem;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: .6rem;
            box-sizing: border-box;
        }
        .column-head {
            display: flex;
            align-items: center;
            gap: .4rem;
            font-weight: 600;
            padding: .1rem .25rem .3rem;
            border-bottom: 2px solid var(--mateu-kanban-accent, var(--lumo-contrast-20pct, #cbd5e1));
        }
        .column-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .count {
            margin-left: auto;
            font-weight: 500;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            border-radius: 999px;
            padding: 0 .5rem;
            font-size: var(--lumo-font-size-xs, .75rem);
        }
        .card {
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-left: 3px solid var(--mateu-kanban-card-accent, transparent);
            border-radius: var(--lumo-border-radius-m, 8px);
            padding: .55rem .65rem;
            display: flex;
            flex-direction: column;
            gap: .3rem;
            box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }
        .card.clickable {
            cursor: pointer;
        }
        .card.clickable:hover {
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .card-title {
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
        }
        .card-desc {
            color: var(--lumo-secondary-text-color, #666);
            font-size: var(--lumo-font-size-xs, .8rem);
        }
        .badge {
            align-self: flex-start;
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.1));
            color: var(--lumo-primary-text-color, #1a73e8);
            border-radius: 999px;
            padding: .05rem .5rem;
            font-size: var(--lumo-font-size-xs, .72rem);
            font-weight: 600;
        }
        @media (prefers-color-scheme: dark) {
            .card { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    `

    private clickCard(card: KanbanCard) {
        if (!card.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: card.actionId, parameters: { _clickedCard: card } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="board">
                ${this.columns.map(column => html`
                    <div class="column" style="${column.color ? `--mateu-kanban-accent: ${column.color};` : ''}">
                        <div class="column-head">
                            <span class="column-title" title="${column.title ?? ''}">${column.title}</span>
                            <span class="count">${column.cards?.length ?? 0}</span>
                        </div>
                        ${(column.cards ?? []).map(card => html`
                            <div class="card ${card.actionId ? 'clickable' : ''}"
                                 style="${card.color ? `--mateu-kanban-card-accent: ${card.color};` : ''}"
                                 @click="${() => this.clickCard(card)}">
                                <span class="card-title">${card.title}</span>
                                ${card.description ? html`<span class="card-desc">${card.description}</span>` : nothing}
                                ${card.badge ? html`<span class="badge">${card.badge}</span>` : nothing}
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-kanban": MateuKanban
    }
}
