import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type { MenuBarItem } from './mateu-app'

/**
 * A menu group that opens as a panel of CARDS (`@Menu(display = cards)` → `display: 'cards'` on
 * the wire), like the product menus of a documentation site: each entry of the group is a card
 * with its title, description and icon/image; an entry with children is not a destination itself
 * — its children are the card's ACTIONS. Design-system neutral (Lumo variables with fallbacks), so
 * every web shell can use it; the shells put it in their top navigation bars in place of the
 * group's dropdown.
 */

export type MenuCard = {
    item: MenuBarItem
    title: string
    description: string
    icon: string
    image: string
    /** the card itself navigates (a leaf); a card with actions does not */
    navigable: boolean
    actions: MenuBarItem[]
}

/** The cards of a group, ready to paint (pure: tested without a DOM). */
export const cardsOf = (group: MenuBarItem): MenuCard[] =>
    ((group.children ?? []) as MenuBarItem[])
        .filter((child) => child && child.component !== 'hr' && child.text)
        .map((child) => {
            const actions = ((child.children ?? []) as MenuBarItem[]).filter((a) => a && a.text && a.component !== 'hr')
            return {
                item: child,
                title: String(child.text ?? ''),
                description: String(child.description ?? ''),
                icon: String(child.icon ?? ''),
                image: String(child.image ?? ''),
                navigable: actions.length === 0,
                actions,
            }
        })

/** Whether an item is a group to show as cards. */
export const isCardsGroup = (item: MenuBarItem | undefined): boolean =>
    !!item && item.display === 'cards' && ((item.children as MenuBarItem[] | undefined)?.length ?? 0) > 0

@customElement('mateu-card-menu')
export class MateuCardMenu extends LitElement {

    @property({ attribute: false }) item: MenuBarItem | undefined
    @property({ attribute: false }) onSelect: ((item: MenuBarItem) => void) | undefined
    @state() open = false

    private outside = (e: Event) => {
        if (!e.composedPath().includes(this)) this.open = false
    }
    private escape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.open) {
            this.open = false
            ;(this.renderRoot.querySelector('.trigger') as HTMLElement | null)?.focus()
        }
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('click', this.outside, true)
        document.addEventListener('keydown', this.escape)
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.outside, true)
        document.removeEventListener('keydown', this.escape)
        super.disconnectedCallback()
    }

    private select(item: MenuBarItem, e?: Event) {
        e?.stopPropagation()
        this.open = false
        this.onSelect?.(item)
    }

    private renderIcon(card: MenuCard) {
        if (card.image) return html`<img class="visual image" src="${card.image}" alt="" />`
        if (card.icon && customElements.get('vaadin-icon')) return html`<vaadin-icon class="visual icon" icon="${card.icon}"></vaadin-icon>`
        return nothing
    }

    render() {
        const item = this.item
        if (!item) return nothing
        const cards = cardsOf(item)
        return html`
            <button class="trigger ${item.selected ? 'active' : ''}" type="button" data-access-key-target
                    aria-haspopup="true" aria-expanded="${this.open ? 'true' : 'false'}"
                    @click="${() => { this.open = !this.open }}">
                ${item.text}<span class="chevron" aria-hidden="true">▾</span>
            </button>
            ${this.open ? html`
                <div class="panel" role="menu" aria-label="${item.text ?? ''}">
                    ${cards.map((card) => html`
                        <div class="card ${card.navigable ? 'navigable' : ''} ${card.item.selected ? 'active' : ''}"
                             role="${card.navigable ? 'menuitem' : 'group'}"
                             tabindex="${card.navigable ? '0' : nothing}"
                             aria-label="${card.title}"
                             @click="${card.navigable ? (e: Event) => this.select(card.item, e) : nothing}"
                             @keydown="${card.navigable ? (e: KeyboardEvent) => {
                                 if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(card.item, e) }
                             } : nothing}">
                            ${this.renderIcon(card)}
                            <div class="body">
                                <div class="title">${card.title}</div>
                                ${card.description ? html`<div class="description">${card.description}</div>` : nothing}
                                ${card.actions.length ? html`
                                    <div class="actions">
                                        ${card.actions.map((action) => html`
                                            <button class="action" type="button" role="menuitem"
                                                    @click="${(e: Event) => this.select(action, e)}">${action.text}</button>`)}
                                    </div>` : nothing}
                            </div>
                        </div>`)}
                </div>` : nothing}
        `
    }

    static styles = css`
        :host { position: relative; display: inline-flex; }
        .trigger {
            font: inherit; background: none; border: 0; cursor: pointer; display: inline-flex; align-items: center;
            gap: 0.25rem; padding: 0.5rem 0.75rem; border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-body-text-color, inherit);
        }
        .trigger:hover, .trigger[aria-expanded="true"] { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .trigger.active { font-weight: 600; }
        .trigger:focus-visible, .card:focus-visible, .action:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: 2px;
        }
        .chevron { font-size: 0.75em; opacity: 0.7; }
        .panel {
            position: absolute; top: calc(100% + 0.25rem); left: 0; z-index: 1000;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 0.5rem;
            width: min(44rem, calc(100vw - 2rem)); padding: 0.75rem; box-sizing: border-box;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 10px);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 24px rgba(0,0,0,.15));
        }
        .card {
            display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.75rem;
            border-radius: var(--lumo-border-radius-m, 6px);
        }
        .card.navigable { cursor: pointer; }
        .card.navigable:hover, .card.active { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .visual { flex: 0 0 auto; }
        .icon { width: 1.5rem; height: 1.5rem; color: var(--lumo-primary-color, #0b6bcb); }
        .image { width: 2.5rem; height: 2.5rem; object-fit: cover; border-radius: var(--lumo-border-radius-s, 4px); }
        .body { min-width: 0; }
        .title { font-weight: 600; font-size: var(--lumo-font-size-m, 1rem); }
        .description { margin-top: 0.125rem; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-secondary-text-color, #555); }
        .actions { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.25rem 0.75rem; }
        .action {
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem); background: none; border: 0; padding: 0;
            cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb);
        }
        .action:hover { text-decoration: underline; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-card-menu': MateuCardMenu
    }
}
