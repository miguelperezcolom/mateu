import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import {dirtyGuard} from "@infra/ui/dirtyGuard.ts";

/** One inbox entry as served by the _notifications-list / _notifications-read actions. */
interface AppNotification {
    id: string
    title: string
    text?: string | null
    route?: string | null
    unread: boolean
    when?: string | null
}

/**
 * The notification inbox bell on the app header (shown when App.notificationsEnabled — the app
 * class implements NotificationsSupplier). A bell icon button with an unread-count badge toggling
 * a dropdown panel with the inbox entries; clicking an entry marks it read (the app-level
 * _notifications-read action, same rail as the @AppContext pickers' remote search: dispatched with
 * the APP's serverSideType + rootRoute) and, when the entry carries a route, navigates exactly
 * like a local menu click (route-changed + navigate-to-requested, handled by mateu-ui). Styled
 * with Lumo CSS vars with fallbacks so every design system can theme it.
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
    private notifications: AppNotification[] = []

    private fetched = false
    private outsideClick: ((e: Event) => void) | undefined

    disconnectedCallback() {
        super.disconnectedCallback();
        this.detachOutsideClick()
    }

    protected updated() {
        // fetch once on first connect so the badge knows the unread count; the app metadata
        // arrives as a property binding, so wait until it is actually set
        if (!this.fetched && this.app?.serverSideType) {
            this.fetched = true
            this.refresh()
        }
    }

    private unreadCount(): number {
        return this.notifications.filter(notification => notification.unread).length
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
            for (const fragment of increment?.fragments ?? []) {
                const data = fragment.data as Record<string, any> | undefined
                const list = data?.['_notifications']
                if (Array.isArray(list)) {
                    this.notifications = list as AppNotification[]
                    return
                }
            }
        } catch {
            // inbox unavailable: keep whatever list we had
        }
    }

    private refresh() {
        return this.runNotificationsAction('_notifications-list', {})
    }

    private markRead(ids: string[] | 'all') {
        return this.runNotificationsAction('_notifications-read', { ids })
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

    private async entryClicked(notification: AppNotification) {
        if (notification.unread) {
            await this.markRead([notification.id])
        }
        const route = notification.route
        if (route) {
            // navigate exactly like a local menu click on the shells (MateuRendererApp.navigate):
            // route-changed pushes the URL, navigate-to-requested re-routes the top-level ux
            if (!dirtyGuard.confirmLeave()) return
            this.closePanel()
            this.dispatchEvent(new CustomEvent('route-changed', {
                detail: { route }, bubbles: true, composed: true,
            }))
            this.dispatchEvent(new CustomEvent('navigate-to-requested', {
                detail: { route }, bubbles: true, composed: true,
            }))
        }
    }

    // ── rendering ────────────────────────────────────────────────────────────

    private renderEntry(notification: AppNotification): TemplateResult {
        return html`
            <div class="entry ${notification.unread ? 'entry--unread' : ''}"
                 @click="${() => this.entryClicked(notification)}">
                <span class="unread-dot" aria-hidden="true"></span>
                <div class="entry-body">
                    <div class="entry-top">
                        <span class="entry-title">${notification.title}</span>
                        ${notification.when ? html`<span class="entry-when">${notification.when}</span>` : nothing}
                    </div>
                    ${notification.text ? html`<div class="entry-text">${notification.text}</div>` : nothing}
                </div>
            </div>`
    }

    private renderPanel(): TemplateResult {
        return html`
            <div class="panel">
                <div class="entries">
                    ${this.notifications.length === 0 ? html`
                        <div class="empty">No notifications</div>` : nothing}
                    ${this.notifications.map(notification => this.renderEntry(notification))}
                </div>
                ${this.notifications.length > 0 ? html`
                    <div class="footer">
                        <button class="mark-all" ?disabled="${this.unreadCount() === 0}"
                                @click="${() => this.markRead('all')}">Mark all read</button>
                    </div>` : nothing}
            </div>`
    }

    render(): TemplateResult {
        const unread = this.unreadCount()
        return html`
            <div class="root">
                <button class="bell-button" title="Notifications" aria-label="Notifications"
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
            color: var(--lumo-body-text-color, #1a1a1a);
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
            color: var(--lumo-tertiary-text-color, rgba(0, 0, 0, 0.45));
        }
        .entry-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
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
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-notification-bell': MateuNotificationBell
    }
}
