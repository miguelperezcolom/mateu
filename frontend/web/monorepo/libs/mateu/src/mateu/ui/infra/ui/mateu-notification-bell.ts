import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import type { MessageAction } from "@mateu/shared/apiClients/dtos/Progress.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import {dirtyGuard} from "@infra/ui/dirtyGuard.ts";
import { onActivate } from '@infra/a11y/activate.ts';
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts';
import { chromeText, chromeTextf, type ChromeTextKey } from '@infra/ui/chromeTexts.ts'
import { markReadVars, notificationsOf, runAppSource } from '@infra/ui/appSources.ts'
import { dispatchAppHeaderAction } from '@infra/ui/renderers/appHeaderActions.ts'
import { notify } from '@application/Notifier.ts'
import { actionLabelOf, runMessageAction } from '@infra/notify/messageToast.ts'
import {
    filtered, groupedByCategory, inboxStore, unreadCount, type InboxEntry, type InboxFilter,
} from '@infra/notify/inboxStore.ts'

/** The reserved app-level actions of the inbox (NotificationsSupplier on the app class). */
export const NOTIFICATIONS_LIST = '_notifications-list'
export const NOTIFICATIONS_READ = '_notifications-read'
export const NOTIFICATIONS_ACT = '_notifications-act'
export const NOTIFICATIONS_DISMISS = '_notifications-dismiss'
export const NOTIFICATIONS_OPEN = '_notifications-open'

const FILTERS: { id: InboxFilter, label: ChromeTextKey }[] = [
    { id: 'all', label: 'notificationFilterAll' },
    { id: 'unread', label: 'notificationFilterUnread' },
    { id: 'resolved', label: 'notificationFilterResolved' },
]

/** The `_notifications` list an answer carries (a Data fragment), if any. */
const listOf = (increment: unknown): InboxEntry[] | undefined => {
    for (const fragment of (increment as { fragments?: { data?: Record<string, unknown> }[] } | undefined)?.fragments ?? []) {
        const list = fragment?.data?.['_notifications']
        if (Array.isArray(list)) return list as InboxEntry[]
    }
    return undefined
}

/**
 * The notification inbox bell on the app header (shown when App.notificationsEnabled — the app
 * class implements NotificationsSupplier). A bell icon button with an unread-count badge toggling
 * a panel with the inbox (design/progress-and-notifications.md):
 *
 * - entries grouped by `category`, filtered (all / unread / resolved), "mark all read";
 * - clicking an entry marks it read and opens it: its `route` (navigated like a local menu click:
 *   route-changed + navigate-to-requested, handled by mateu-ui) or, for `hasDetail`, the detail the
 *   server answers for `_notifications-open` (a Drawer, a Dialog…) on the on-screen component;
 * - an entry's actions run on the server (`_notifications-act`, which usually resolves it); its ✕
 *   dismisses it (`_notifications-dismiss`);
 * - the list is the server's (`_notifications-list`) merged with the session's own entries (an
 *   `inbox` message, an entry pushed live), deduplicated by id (inboxStore.ts); a live change
 *   updates the badge without polling.
 *
 * Every action goes to the APP (its serverSideType + rootRoute), the same rail as the @AppContext
 * pickers' remote search. Styled with Lumo CSS vars with fallbacks so every design system can theme it.
 */
@customElement('mateu-notification-bell')
export class MateuNotificationBell extends LitElement {

    @property()
    app: App | undefined

    @property()
    baseUrl = ''

    @state()
    private opened = false

    @state()
    private entries: InboxEntry[] = inboxStore.entries()

    @state()
    private filter: InboxFilter = 'all'

    private fetched = false
    private outsideClick: ((e: Event) => void) | undefined
    private unsubscribe: (() => void)[] = []

    connectedCallback() {
        super.connectedCallback()
        this.entries = inboxStore.entries()
        this.unsubscribe.push(inboxStore.subscribe(() => { this.entries = inboxStore.entries() }))
        // a live change too big to describe ("refresh"): ask the server again
        this.unsubscribe.push(inboxStore.onRefetch(() => { void this.refresh() }))
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.detachOutsideClick()
        this.unsubscribe.forEach((u) => u())
        this.unsubscribe = []
    }

    protected updated() {
        // fetch once on first connect so the badge knows the unread count; the app metadata
        // arrives as a property binding, so wait until it is actually set
        if (!this.fetched && (this.app?.serverSideType || this.app?.notificationsSource)) {
            this.fetched = true
            this.refresh()
        }
    }

    private unreadCount(): number {
        return unreadCount(this.entries)
    }

    // ── server round-trips (same client mechanism as the @AppContext pickers) ──

    private async runNotificationsAction(actionId: string, parameters: Record<string, unknown>) {
        const app = this.app
        if (!app?.serverSideType) return
        try {
            const increment = await mateuApiClient.runAction(
                this.baseUrl ?? '',
                app.rootRoute ?? app.initialRoute ?? '',
                '',
                actionId,
                'notification-bell',
                undefined,
                app.serverSideType,
                {},
                parameters,
                this,
                true
            )
            const list = listOf(increment)
            if (list) inboxStore.setServerList(list)
        } catch {
            // inbox unavailable: keep whatever list we had
        }
    }

    /**
     * An action whose answer may be more than the list — a message, a Drawer with the entry's
     * detail: run on the component on screen (dispatchAppHeaderAction), so it lands on a real
     * component; the refreshed list it also carries reaches the inbox.
     */
    private async runOnScreen(actionId: string, parameters: Record<string, unknown>) {
        const app = this.app
        if (!app?.serverSideType) return
        const root = this.getRootNode() as ShadowRoot | Document
        const shell = ((root as ShadowRoot).host ?? document.body) as HTMLElement & { baseUrl?: string }
        const container = Object.assign(shell, { baseUrl: this.baseUrl ?? shell.baseUrl ?? '' })
        try {
            await dispatchAppHeaderAction(app, container, actionId, parameters, (increment) => {
                const list = listOf(increment)
                if (list) inboxStore.setServerList(list)
            })
        } catch {
            notify({ text: chromeText('notificationActionFailed'), variant: 'error' }, this)
        }
    }

    private refresh() {
        // a data-authored shell lists its inbox from a REST source (notifications.source); an app
        // class implementing NotificationsSupplier answers the _notifications-list action
        const source = this.app?.notificationsSource
        if (this.app && source) {
            return runAppSource(this.app, this.baseUrl ?? '', 'notifications', source, {}, this)
                .then((json) => { inboxStore.setServerList(notificationsOf(json, source)) })
                .catch(() => undefined) // inbox unavailable: keep whatever list we had
        }
        return this.runNotificationsAction(NOTIFICATIONS_LIST, {})
    }

    private isServerEntry(entry: InboxEntry): boolean {
        return !entry.local
    }

    private async markRead(ids: string[] | 'all') {
        // read locally at once: an inbox with no "mark as read" call is still read on screen
        const serverIds = ids === 'all'
            ? 'all'
            : ids.filter((id) => this.entries.some((e) => e.id === id && this.isServerEntry(e)))
        inboxStore.markRead(ids)
        if (serverIds !== 'all' && serverIds.length === 0) return
        if (this.app?.notificationsSource) {
            const read = this.app.notificationsReadSource
            const all = serverIds === 'all'
            const which = all ? this.entries.filter((n) => n.unread).map((n) => n.id) : serverIds
            if (read) {
                try {
                    await runAppSource(this.app, this.baseUrl ?? '', 'notificationsRead', read, markReadVars(which, all), this)
                    await this.refresh()
                } catch {
                    // the server keeps them unread; the next refresh says so
                }
            }
            return
        }
        return this.runNotificationsAction(NOTIFICATIONS_READ, { ids: serverIds })
    }

    private async dismiss(entry: InboxEntry) {
        inboxStore.remove(entry.id)
        if (!this.isServerEntry(entry) || this.app?.notificationsSource) return
        await this.runNotificationsAction(NOTIFICATIONS_DISMISS, { ids: [entry.id] })
    }

    private async act(entry: InboxEntry, action: MessageAction) {
        if (action.route) {
            this.navigate(action.route)
            return
        }
        if (!this.isServerEntry(entry)) {
            // a session entry made from a message: its actions run where the message came from
            if (entry.initiator?.isConnected) runMessageAction(action, entry.initiator)
            return
        }
        if (!action.actionId) return
        await this.runOnScreen(NOTIFICATIONS_ACT, { id: entry.id, actionId: action.actionId })
    }

    // ── panel ────────────────────────────────────────────────────────────────

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private openPanel() {
        if (this.opened) return
        this.opened = true
        // the count from the last fetch may be stale — refetch each time the panel opens
        this.refresh()
        this.outsideClick = (e: Event) => {
            if (!e.composedPath().includes(this)) this.closePanel()
        }
        document.addEventListener('mousedown', this.outsideClick)
    }

    private closePanel() {
        this.detachOutsideClick()
        this.opened = false
    }

    private navigate(route: string): boolean {
        // navigate exactly like a local menu click on the shell:
        // route-changed pushes the URL, navigate-to-requested re-routes the top-level ux
        if (!dirtyGuard.confirmLeave()) return false
        this.closePanel()
        this.dispatchEvent(new CustomEvent('route-changed', {
            detail: { route }, bubbles: true, composed: true,
        }))
        this.dispatchEvent(new CustomEvent('navigate-to-requested', {
            detail: { route }, bubbles: true, composed: true,
        }))
        return true
    }

    private async entryClicked(notification: InboxEntry) {
        if (notification.unread) {
            await this.markRead([notification.id])
        }
        if (notification.route) {
            this.navigate(notification.route)
        } else if (notification.hasDetail && this.isServerEntry(notification)) {
            this.closePanel()
            await this.runOnScreen(NOTIFICATIONS_OPEN, { id: notification.id })
        }
    }

    // ── rendering ────────────────────────────────────────────────────────────

    private renderEntry(notification: InboxEntry): TemplateResult {
        const actions = notification.resolved ? [] : (notification.actions ?? [])
        return html`
            <div class="item ${notification.resolved ? 'item--resolved' : ''} ${notification.variant ? 'item--' + notification.variant : ''}">
                <div role="button" tabindex="0" class="entry ${notification.unread ? 'entry--unread' : ''}"
                     @click="${() => this.entryClicked(notification)}" @keydown="${onActivate(() => this.entryClicked(notification))}">
                    <span class="unread-dot" aria-hidden="true"></span>
                    <div class="entry-body">
                        <div class="entry-top">
                            <span class="entry-title">${notification.title}</span>
                            ${notification.when ? html`<span class="entry-when">${notification.when}</span>` : nothing}
                        </div>
                        ${notification.text ? html`<div class="entry-text">${notification.text}</div>` : nothing}
                        ${notification.resolved ? html`<div class="entry-resolved">${chromeText('notificationResolved')}</div>` : nothing}
                    </div>
                </div>
                <button class="dismiss" aria-label="${chromeTextf('notificationDismissOf', { title: notification.title })}"
                        title="${chromeText('notificationDismiss')}"
                        @click="${() => this.dismiss(notification)}">✕</button>
                ${actions.length > 0 ? html`
                    <div class="entry-actions">
                        ${actions.map((action, i) => html`
                            <button class="entry-action ${i === 0 || action.style === 'primary' ? 'entry-action--primary' : ''} ${action.style === 'danger' ? 'entry-action--danger' : ''}"
                                    @click="${() => this.act(notification, action)}">${actionLabelOf(action)}</button>`)}
                    </div>` : nothing}
            </div>`
    }

    private renderPanel(): TemplateResult {
        const shown = filtered(this.entries, this.filter)
        const groups = groupedByCategory(shown)
        return html`
            <div class="panel">
                <div class="filters" role="group" aria-label="${chromeText('notificationFilters')}">
                    ${FILTERS.map((f) => html`
                        <button class="filter ${this.filter === f.id ? 'filter--on' : ''}"
                                aria-pressed="${this.filter === f.id ? 'true' : 'false'}"
                                @click="${() => { this.filter = f.id }}">${chromeText(f.label)}</button>`)}
                </div>
                <div class="entries">
                    ${shown.length === 0 ? html`
                        <div class="empty">${chromeText('noNotifications')}</div>` : nothing}
                    ${groups.map((group) => html`
                        ${group.category ? html`<div class="group" role="heading" aria-level="3">${group.category}</div>` : nothing}
                        ${group.entries.map(notification => this.renderEntry(notification))}`)}
                </div>
                ${this.entries.length > 0 ? html`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount() === 0}"
                                @click="${() => this.markRead('all')}">${chromeText('markAllRead')}</button>
                    </div>` : nothing}
            </div>`
    }

    render(): TemplateResult {
        const unread = this.unreadCount()
        return html`
            <div class="root">
                <button class="bell-button" data-access-key-target title="${chromeText('notifications')}"
                        aria-label="${unread > 0 ? chromeTextf('notificationsUnread', { count: unread }) : chromeText('notifications')}"
                        aria-haspopup="true" aria-expanded="${this.opened ? 'true' : 'false'}"
                        @click="${() => this.opened ? this.closePanel() : this.openPanel()}">
                    <svg class="bell-icon" viewBox="0 0 24 24" aria-hidden="true"
                         fill="none" stroke="currentColor" stroke-width="1.8"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    ${unread > 0 ? html`<span class="badge">${unread > 99 ? '99+' : unread}</span>` : nothing}
                </button>
                ${this.opened ? this.renderPanel() : nothing}
            </div>`
    }

    static styles = css`
        :host {
            display: inline-flex;
            position: relative;
            flex-shrink: 0;
        }
        .root {
            display: inline-flex;
            position: relative;
            align-items: center;
            margin-left: 0.5rem;
        }
        .bell-button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font: inherit;
            /* the header's one icon colour (mateu-app: --mateu-header-icon-color) */
            color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573));
            background: transparent;
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.3rem;
            cursor: pointer;
            outline: none;
        }
        .bell-button:hover {
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
        }
        .bell-icon {
            width: 1.25rem;
            height: 1.25rem;
        }
        .badge {
            position: absolute;
            top: -2px;
            right: -4px;
            min-width: 1rem;
            height: 1rem;
            box-sizing: border-box;
            padding: 0 0.2rem;
            border-radius: 0.5rem;
            background: var(--lumo-error-color, #d32f2f);
            color: #fff;
            font-size: 0.65rem;
            font-weight: 600;
            line-height: 1rem;
            text-align: center;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            width: 20rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
        }
        .entries {
            max-height: 20rem;
            overflow-y: auto;
            padding: 0.3rem;
        }
        .empty {
            padding: 0.8rem 0.5rem;
            text-align: center;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .entry {
            display: flex;
            align-items: flex-start;
            gap: 0.4rem;
            padding: 0.45rem 0.5rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
        }
        .entry:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .unread-dot {
            flex-shrink: 0;
            width: 0.45rem;
            height: 0.45rem;
            margin-top: 0.4rem;
            border-radius: 50%;
            background: transparent;
        }
        .entry--unread .unread-dot {
            background: var(--lumo-primary-color, #1976d2);
        }
        .entry-body {
            flex: 1;
            min-width: 0;
        }
        .entry-top {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
        }
        .entry-title {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .entry--unread .entry-title {
            font-weight: 600;
        }
        .entry-when {
            flex-shrink: 0;
            margin-left: auto;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, #5f6b7a));
        }
        .entry-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .filters {
            display: flex;
            gap: 0.25rem;
            padding: 0.4rem 0.4rem 0;
        }
        .filter {
            font: inherit;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            background: transparent;
            color: var(--lumo-body-text-color, #1a1a1a);
            cursor: pointer;
        }
        .filter--on {
            background: var(--lumo-primary-color-10pct, rgba(25, 118, 210, 0.1));
            border-color: var(--lumo-primary-color, #1976d2);
            color: var(--lumo-primary-text-color, #1976d2);
        }
        .group {
            padding: 0.5rem 0.5rem 0.15rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            color: var(--lumo-secondary-text-color, #5f6b7a);
        }
        .item {
            position: relative;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: start;
        }
        .item--resolved .entry-title {
            color: var(--lumo-secondary-text-color, #5f6b7a);
        }
        .item--error .entry--unread .unread-dot { background: var(--lumo-error-color, #c62828); }
        .item--warning .entry--unread .unread-dot { background: var(--lumo-warning-color, #f9a825); }
        .entry-resolved {
            font-size: var(--lumo-font-size-xxs, 0.7rem);
            color: var(--lumo-success-text-color, #2e7d32);
        }
        .dismiss {
            font: inherit;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            background: none;
            border: none;
            color: var(--lumo-secondary-text-color, #5f6b7a);
            cursor: pointer;
            padding: 0.45rem 0.4rem;
            border-radius: var(--lumo-border-radius-s, 4px);
        }
        .dismiss:hover { background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04)); }
        .entry-actions {
            grid-column: 1 / -1;
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
            padding: 0 0.5rem 0.45rem 1.35rem;
        }
        .entry-action {
            font: inherit;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            padding: 0.2rem 0.6rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            background: transparent;
            color: var(--lumo-primary-text-color, #1976d2);
            cursor: pointer;
        }
        .entry-action--primary {
            background: var(--lumo-primary-color, #1976d2);
            color: var(--lumo-primary-contrast-color, #fff);
            border-color: transparent;
        }
        .entry-action--danger {
            color: var(--lumo-error-text-color, #c62828);
        }
        .footer {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
            padding: 0.3rem;
        }
        .mark-all {
            width: 100%;
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-primary-text-color, #1976d2);
            background: transparent;
            border: none;
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.35rem 0.5rem;
            cursor: pointer;
            outline: none;
        }
        .mark-all:hover:not([disabled]) {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .mark-all[disabled] {
            color: var(--lumo-disabled-text-color, rgba(0, 0, 0, 0.3));
            cursor: default;
        }
    
        ${activatableFocusStyles}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-notification-bell': MateuNotificationBell
    }
}
