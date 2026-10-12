import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { AppShortcut } from '@mateu/shared/apiClients/dtos/componentmetadata/AppShellExtras.ts'
import { appShortcutFor, isHelpKey, isTypingTarget } from '@infra/ui/appShortcuts.ts'
import { installHeaderValuesWatcher, seedHeaderValues } from '@infra/ui/headerValues.ts'
import { syncLiveUpdates } from '@infra/ui/liveUpdates.ts'
import { dispatchAppHeaderAction } from '@infra/ui/renderers/appHeaderActions.ts'
import { navigateToRoute } from '@infra/ui/rowRoute.ts'
import { dirtyGuard } from '@infra/ui/dirtyGuard.ts'
import type { MateuShortcutsHelp } from '@infra/ui/mateu-shortcuts-help.ts'
import type { MateuIdleWarning } from '@infra/ui/mateu-idle-warning.ts'
import '@infra/ui/mateu-shortcuts-help.ts'
import '@infra/ui/mateu-idle-warning.ts'

/**
 * The app-level extras of the E2 patterns, wired from ONE place — the shell's `updated()` — like the
 * command center (commandCenterMount.ts):
 *
 * - app-wide shortcuts (`@AppShortcut`) + the `?` overlay (mateu-shortcuts-help), on a WINDOW
 *   listener so a screen's own shortcut, handled on document first, wins;
 * - live header values: the store is seeded from the shell and follows the other tabs; the event
 *   stream runs when the app asks for it (liveUpdates.ts);
 * - the idle-session warning (mateu-idle-warning), mounted when the app configures one.
 *
 * Document-wide singletons: nested MEDIATOR shells are skipped, the top shell owns them.
 */
type Host = HTMLElement & { renderRoot: ParentNode, component: unknown, baseUrl?: string }

let owner: Host | null = null
let app: App | undefined
let help: MateuShortcutsHelp | null = null
let idle: MateuIdleWarning | null = null
let keysInstalled = false

/** Runs an app shortcut from wherever it was picked (key, overlay, palette). */
export const runAppShortcut = (shortcut: AppShortcut, from?: HTMLElement) => {
    const host = (from ?? owner) as Host | null
    if (!host || !app) return
    if (shortcut.route) {
        if (!dirtyGuard.confirmLeave()) return
        navigateToRoute(host, shortcut.route)
    } else if (shortcut.actionId) {
        void dispatchAppHeaderAction(app, owner ?? host, shortcut.actionId).catch(() => undefined)
    }
}

const onKeydown = (e: KeyboardEvent) => {
    if (e.defaultPrevented || !app || !owner?.isConnected) return
    const typing = isTypingTarget(document.activeElement)
    const shortcuts = app.shortcuts ?? []
    if (shortcuts.length && isHelpKey(e, typing)) {
        e.preventDefault()
        help?.show()
        return
    }
    const hit = appShortcutFor(shortcuts, e, typing)
    if (!hit) return
    e.preventDefault()
    runAppShortcut(hit)
}

export function syncAppExtras(host: Host): void {
    const md = (host.component as ClientSideComponent | undefined)?.metadata as App | undefined
    if (!md || md.variant === 'MEDIATOR') return
    if (owner && owner !== host && owner.isConnected) return // another top shell owns them
    owner = host
    app = md
    const baseUrl = host.baseUrl ?? ''

    // live header values
    seedHeaderValues(md.headerValues)
    installHeaderValuesWatcher()
    syncLiveUpdates(md, baseUrl)

    // app shortcuts + "?"
    if ((md.shortcuts?.length ?? 0) > 0) {
        if (!help || !help.isConnected) {
            help = document.createElement('mateu-shortcuts-help') as MateuShortcutsHelp
            host.renderRoot.appendChild(help)
        }
        help.shortcuts = md.shortcuts ?? []
        help.run = (s) => runAppShortcut(s)
        if (!keysInstalled) {
            keysInstalled = true
            window.addEventListener('keydown', onKeydown)
        }
    } else if (help) {
        help.remove()
        help = null
    }

    // idle-session warning
    if (md.idleSession && md.idleSession.timeoutSeconds > 0) {
        if (!idle || !idle.isConnected) {
            idle = document.createElement('mateu-idle-warning') as MateuIdleWarning
            document.body.appendChild(idle)
        }
        idle.app = md
        idle.baseUrl = baseUrl
    } else if (idle) {
        idle.remove()
        idle = null
    }
}

/** The app whose shortcuts are active (the palettes read it). */
export const activeAppShortcuts = (): AppShortcut[] => app?.shortcuts ?? []
