import { ifDefined } from 'lit/directives/if-defined.js'
import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import KanbanColumn from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanColumn";
import KanbanCard from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanCard";
import RestDataSource from "@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts";
import { onActivate, buttonRole, tabStop } from '@infra/a11y/activate.ts';
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts';
import { announce } from '@infra/a11y/announcer.ts';
import { fetchExternalJson } from '@infra/http/externalOptions.ts';
import { resolveRestSource, viaProxy } from '@infra/http/restSourceCatalogue.ts';
import { templateResolver } from '@infra/ui/interpolation.ts';
import { navigateToRoute } from '@infra/ui/rowRoute.ts';
import { chromeTextf, chromeText } from '@infra/ui/chromeTexts.ts';
import {
    BoardCard, BoardColumn, KanbanMove, cardRouteOf, cardsFromRows, dropIndexOf, isRealMove, itemsOf,
    moveCard, moveParameters,
} from '@infra/ui/kanbanModel.ts';

/**
 * Dependency-free kanban board: horizontally scrolling columns, each with a header (title + count)
 * and a stack of cards. A card with an actionId is clickable and dispatches the standard
 * action-requested event. Design-system neutral (Lumo CSS vars + fallbacks), dark-mode aware.
 *
 * <p>With a `moveActionId` its cards MOVE: dragged to another column or to another place in their own
 * (a line shows where it will land), or from the keyboard through each card's "Move" menu. The card
 * moves at once and the action runs with its row + `_cardId/_fromColumnId/_toColumnId/_toIndex`; a
 * failure puts it back. With a `rowsSource` the board is LIVE: its cards are the source's items
 * (kanbanModel.cardsFromRows), read again after every successful move.
 */
@customElement('mateu-kanban')
export class MateuKanban extends LitElement {

    @property({ type: Array })
    columns: KanbanColumn[] = []

    /** The board's component id: a proxied source is fetched by it. */
    @property()
    boardId: string | undefined

    @property()
    moveActionId: string | undefined

    @property({ attribute: false })
    rowsSource: RestDataSource | undefined

    @property()
    columnField: string | undefined

    @property({ attribute: false })
    card: KanbanCard | undefined

    @property({ attribute: false })
    cardColors: Record<string, string> | undefined

    @property()
    cardRoute: string | undefined

    @property({ attribute: false })
    state: Record<string, unknown> = {}

    @property({ attribute: false })
    data: Record<string, unknown> = {}

    /** The cards read from rowsSource (a live board). */
    @state()
    private live: BoardColumn[] | undefined

    /** The board right after a move, until the action answers. */
    @state()
    private optimistic: BoardColumn[] | undefined

    @state()
    private dragging: { cardId: string, fromColumnId: string } | undefined

    @state()
    private dropTarget: { columnId: string, index: number } | undefined

    /** The card whose "Move" menu is open. */
    @state()
    private menuFor: string | undefined

    private loadedSignature: string | undefined
    private releaseHost: (() => void) | undefined

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
            min-height: 4rem;
        }
        .column.drop-here {
            outline: 2px dashed var(--lumo-primary-color-50pct, rgba(26,115,232,.5));
            outline-offset: -2px;
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
        .drop-line {
            height: 3px;
            border-radius: 2px;
            background: var(--lumo-primary-color, #1a73e8);
        }
        .card {
            position: relative;
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
        .card.movable {
            cursor: grab;
        }
        .card.dragging {
            opacity: .45;
        }
        .card.clickable:hover, .card.movable:hover {
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .card-title {
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            padding-right: 1.6rem;
        }
        .card-desc {
            color: var(--lumo-secondary-text-color, #666);
            font-size: var(--lumo-font-size-xs, .8rem);
        }
        .badge {
            align-self: flex-start;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: 999px;
            padding: .05rem .5rem;
            font-size: var(--lumo-font-size-xs, .72rem);
            font-weight: 600;
        }
        .move {
            position: absolute;
            top: .3rem;
            right: .3rem;
            font: inherit;
            line-height: 1;
            border: none;
            background: transparent;
            color: var(--lumo-secondary-text-color, #666);
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: .15rem .35rem;
            cursor: pointer;
        }
        .move:hover {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .menu {
            position: absolute;
            top: 1.8rem;
            right: .3rem;
            z-index: 2;
            display: flex;
            flex-direction: column;
            min-width: 10rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            border-radius: var(--lumo-border-radius-m, 8px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0,0,0,.15));
            padding: .25rem 0;
        }
        .menu button {
            font: inherit;
            text-align: left;
            border: none;
            background: transparent;
            color: var(--lumo-body-text-color, #222);
            padding: .4rem .75rem;
            cursor: pointer;
        }
        .menu button:hover, .menu button:focus-visible {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }

        ${activatableFocusStyles}
    `

    /** What is on screen: a pending move, else the live cards, else the declared ones. */
    private get shown(): BoardColumn[] {
        return this.optimistic ?? this.live ?? (this.columns ?? [])
    }

    private get movable(): boolean {
        return !!this.moveActionId
    }

    connectedCallback() {
        super.connectedCallback()
        // a move answered by the SERVER that fails puts the card back: the failure is announced on
        // the component that sent the action, an ancestor across shadow roots
        const host = this.owningComponent()
        if (host) {
            const failed = () => this.revert()
            host.addEventListener('backend-failed-event', failed)
            this.releaseHost = () => host.removeEventListener('backend-failed-event', failed)
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.releaseHost?.()
        this.releaseHost = undefined
    }

    protected willUpdate(changed: PropertyValues) {
        // the server re-rendered the board: it is the truth now, whatever was moved before
        if (changed.has('columns') && changed.get('columns') !== undefined) this.optimistic = undefined
        if (changed.has('rowsSource') || changed.has('state') || changed.has('data')) this.loadIfNeeded()
    }

    private owningComponent(): HTMLElement | undefined {
        let node: Node | null = this
        while (node) {
            const root = node.getRootNode() as ShadowRoot | Document
            const host = (root as ShadowRoot).host as HTMLElement | undefined
            if (!host) return undefined
            if (host.tagName === 'MATEU-COMPONENT') return host
            node = host
        }
        return undefined
    }

    /** Reads the live board's source when it (or the url it resolves to) changed. */
    private loadIfNeeded(force = false) {
        const source = this.rowsSource
        if (!source) return
        let signature: string
        try {
            signature = JSON.stringify([source, templateResolver(this.state, this.data)(resolveRestSource(source).url ?? '')])
        } catch {
            signature = String(Math.random())
        }
        if (!force && signature === this.loadedSignature) return
        this.loadedSignature = signature
        this.load(source)
    }

    private load(source: RestDataSource): Promise<void> {
        const shape = (json: unknown) => {
            this.live = cardsFromRows(this, itemsOf(json, resolveRestSource(source).itemsPath), this.state, this.data)
        }
        if (viaProxy(source)) {
            return new Promise((resolve) => {
                this.dispatchEvent(new CustomEvent('action-requested', {
                    detail: {
                        actionId: '__restfetch__',
                        parameters: { _sourceKind: 'rows', _sourceId: this.boardId ?? 'kanban' },
                        callback: (uiIncrement: { appData?: Record<string, unknown> } | undefined) => {
                            if (!uiIncrement?.appData?.['_restfetchError']) shape(uiIncrement?.appData?.['_restfetch'])
                            resolve()
                        },
                        callbackonly: true,
                    },
                    bubbles: true,
                    composed: true,
                }))
            })
        }
        return fetchExternalJson(source, templateResolver(this.state, this.data))
            .then(shape)
            .catch((e) => console.warn('mateu: kanban rows fetch failed', e))
    }

    private clickCard(card: BoardCard) {
        const route = cardRouteOf(this.cardRoute, card, this.state, this.data)
        if (route) {
            navigateToRoute(this, route)
            return
        }
        if (!card.actionId) {
            return
        }
        const { row, ...plain } = card
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: card.actionId, parameters: { ...(row ?? {}), _clickedCard: plain } },
            bubbles: true,
            composed: true
        }))
    }

    private revert() {
        if (!this.optimistic) return
        this.optimistic = undefined
        announce(chromeText('kanbanMoveFailed'), { politeness: 'assertive' })
    }

    /** Moves the card on screen and runs the move action; a failure puts it back. */
    commit(move: KanbanMove) {
        const before = this.shown
        if (!this.movable || !isRealMove(before, move)) return
        const card = before.find(c => c.id === move.fromColumnId)?.cards?.find(c => c.id === move.cardId)
        this.optimistic = moveCard(before, move)
        const column = before.find(c => c.id === move.toColumnId)
        announce(chromeTextf('kanbanMoved', { card: card?.title ?? '', column: column?.title ?? '', position: move.toIndex + 1 }))
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: this.moveActionId,
                parameters: moveParameters(card, move),
                // answered by a REST action (mateu-component.handleRestAction): a live board reads its
                // source again, keeping the moved card where it is until the new cards arrive
                settled: (ok: boolean) => {
                    if (!ok) {
                        this.revert()
                        return
                    }
                    if (this.rowsSource) {
                        this.load(this.rowsSource).then(() => { this.optimistic = undefined })
                    }
                },
            },
            bubbles: true,
            composed: true,
        }))
    }

    // ── drag and drop ────────────────────────────────────────────────────────────────────────────

    private onDragStart(e: DragEvent, card: BoardCard, column: BoardColumn) {
        if (!this.movable || !card.id || !column.id) return
        this.dragging = { cardId: card.id, fromColumnId: column.id }
        this.menuFor = undefined
        e.dataTransfer?.setData('text/plain', card.id)
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
    }

    private dropIndexAt(e: DragEvent, columnEl: HTMLElement): number {
        const cards = [...columnEl.querySelectorAll<HTMLElement>('.card')]
            .filter(el => el.dataset.cardId !== this.dragging?.cardId)
        return dropIndexOf(e.clientY, cards.map(el => {
            const r = el.getBoundingClientRect()
            return r.top + r.height / 2
        }))
    }

    private onDragOver(e: DragEvent, column: BoardColumn) {
        if (!this.dragging || !column.id) return
        e.preventDefault()
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
        const index = this.dropIndexAt(e, e.currentTarget as HTMLElement)
        if (this.dropTarget?.columnId !== column.id || this.dropTarget.index !== index) {
            this.dropTarget = { columnId: column.id, index }
        }
    }

    private onDrop(e: DragEvent, column: BoardColumn) {
        if (!this.dragging || !column.id) return
        e.preventDefault()
        const index = this.dropIndexAt(e, e.currentTarget as HTMLElement)
        const move = { ...this.dragging, toColumnId: column.id, toIndex: index }
        this.dragging = undefined
        this.dropTarget = undefined
        this.commit(move)
    }

    private onDragEnd() {
        this.dragging = undefined
        this.dropTarget = undefined
    }

    // ── keyboard: the card's Move menu ───────────────────────────────────────────────────────────

    private menuMoves(card: BoardCard, column: BoardColumn): { label: string, move: KanbanMove }[] {
        const index = column.cards?.findIndex(c => c.id === card.id) ?? 0
        const base = { cardId: card.id ?? '', fromColumnId: column.id ?? '' }
        const out: { label: string, move: KanbanMove }[] = []
        if (index > 0) out.push({ label: chromeText('kanbanMoveUp'), move: { ...base, toColumnId: base.fromColumnId, toIndex: index - 1 } })
        if (index < (column.cards?.length ?? 0) - 1) {
            out.push({ label: chromeText('kanbanMoveDown'), move: { ...base, toColumnId: base.fromColumnId, toIndex: index + 1 } })
        }
        for (const other of this.shown) {
            if (other.id === column.id || !other.id) continue
            out.push({ label: chromeTextf('kanbanMoveTo', { column: other.title ?? other.id }), move: { ...base, toColumnId: other.id, toIndex: other.cards?.length ?? 0 } })
        }
        return out
    }

    private toggleMenu(e: Event, card: BoardCard) {
        e.stopPropagation()
        this.menuFor = this.menuFor === card.id ? undefined : card.id
        if (this.menuFor) {
            this.updateComplete.then(() => (this.renderRoot.querySelector('.menu button') as HTMLElement | null)?.focus())
        }
    }

    private onMenuKeydown(e: KeyboardEvent, card: BoardCard) {
        const items = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button')]
        const at = items.indexOf((this.renderRoot as ShadowRoot).activeElement as HTMLElement)
        if (e.key === 'Escape') {
            e.preventDefault()
            this.menuFor = undefined
            ;(this.renderRoot.querySelector(`[data-move-for="${CSS.escape(card.id ?? '')}"]`) as HTMLElement | null)?.focus()
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            const next = (at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
            items[next]?.focus()
        }
    }

    private pick(e: Event, move: KanbanMove) {
        e.stopPropagation()
        this.menuFor = undefined
        this.commit(move)
    }

    render() {
        const shown = this.shown
        return html`
            <div class="board">
                ${shown.map(column => this.renderColumn(column))}
            </div>
        `
    }

    private renderColumn(column: BoardColumn) {
        const target = this.dropTarget?.columnId === column.id ? this.dropTarget : undefined
        const cards = column.cards ?? []
        const visible = cards.filter(c => c.id !== this.dragging?.cardId || !target)
        return html`
            <div class="column ${target ? 'drop-here' : ''}" data-column-id="${column.id ?? ''}"
                 style="${column.color ? `--mateu-kanban-accent: ${column.color};` : ''}"
                 @dragover="${(e: DragEvent) => this.onDragOver(e, column)}"
                 @drop="${(e: DragEvent) => this.onDrop(e, column)}">
                <div class="column-head">
                    <span class="column-title" title="${column.title ?? ''}">${column.title}</span>
                    <span class="count">${cards.length}</span>
                </div>
                ${visible.map((card, i) => html`
                    ${target && target.index === i ? html`<div class="drop-line"></div>` : nothing}
                    ${this.renderCard(card, column)}
                `)}
                ${target && target.index >= visible.length ? html`<div class="drop-line"></div>` : nothing}
            </div>
        `
    }

    private renderCard(card: BoardCard, column: BoardColumn) {
        const clickable = !!card.actionId || !!cardRouteOf(this.cardRoute, card, this.state, this.data)
        const movable = this.movable && !!card.id
        return html`
            <div role=${ifDefined(buttonRole(clickable))} tabindex=${ifDefined(tabStop(clickable))}
                 class="card ${clickable ? 'clickable' : ''} ${movable ? 'movable' : ''} ${this.dragging?.cardId === card.id ? 'dragging' : ''}"
                 data-card-id="${card.id ?? ''}"
                 draggable="${movable ? 'true' : 'false'}"
                 style="${card.color ? `--mateu-kanban-card-accent: ${card.color};` : ''}"
                 @dragstart="${(e: DragEvent) => this.onDragStart(e, card, column)}"
                 @dragend="${() => this.onDragEnd()}"
                 @click="${() => this.clickCard(card)}" @keydown="${onActivate(() => this.clickCard(card))}">
                <span class="card-title">${card.title}</span>
                ${card.description ? html`<span class="card-desc">${card.description}</span>` : nothing}
                ${card.badge ? html`<span class="badge">${card.badge}</span>` : nothing}
                ${movable ? html`
                    <button class="move" data-move-for="${card.id}" aria-haspopup="menu"
                            aria-expanded="${this.menuFor === card.id ? 'true' : 'false'}"
                            aria-label="${chromeTextf('kanbanMove', { card: card.title ?? '' })}"
                            title="${chromeTextf('kanbanMove', { card: card.title ?? '' })}"
                            @click="${(e: Event) => this.toggleMenu(e, card)}"
                            @keydown="${(e: KeyboardEvent) => e.stopPropagation()}">⋯</button>
                    ${this.menuFor === card.id ? html`
                        <div class="menu" role="menu" @keydown="${(e: KeyboardEvent) => this.onMenuKeydown(e, card)}"
                             @click="${(e: Event) => e.stopPropagation()}">
                            ${this.menuMoves(card, column).map(item => html`
                                <button role="menuitem" @click="${(e: Event) => this.pick(e, item.move)}">${item.label}</button>
                            `)}
                        </div>` : nothing}
                ` : nothing}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-kanban": MateuKanban
    }
}
