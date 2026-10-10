import UICommand from '../../../shared/apiClients/dtos/UICommand.ts'
import type Action from '../../../shared/apiClients/dtos/componentmetadata/Action.ts'
import { resolveOwnerFirst } from './actionCatalogue.ts'

/**
 * The FLOWS an app shell declares (`actions:` with `steps:` on a `type: AppShell`, or
 * `AppShell.actions` in code) travel on the wire App as `actions`, each with its steps already
 * lowered to `commands`. A menu leaf whose `RunAction` rule names one of them runs those commands in
 * the browser — no server round-trip, so the menu also works in a static bundle and in the visual
 * editor's Play. An id the shell does not declare (or declares without steps) keeps today's
 * behaviour: an app-level action dispatched to the server.
 *
 * Pure (no DOM, no `this`) so the decision is unit-testable and lives in one place.
 */
export function shellFlowFor(
    app: ShellLike | undefined,
    actionId: string | undefined,
): UICommand[] | undefined {
    const action = shellActionFor(app, actionId)
    return action?.commands && action.commands.length ? action.commands : undefined
}

type ShellLike = {
    actions?: { id?: string, commands?: UICommand[] | undefined }[] | undefined,
    actionCatalogue?: Action[] | undefined,
}

/**
 * The action a menu leaf (or a shell flow's RunAction) names, OWNER FIRST: the shell's own
 * `actions:` — even one without steps, which is the shell's server action — then the app's action
 * catalogue (`App.actionCatalogue`, else the client-side store fed by a bundle or the editor's Play).
 * Undefined: nobody declares it client-side → an app-level server action, as before.
 */
export function shellActionFor(app: ShellLike | undefined, actionId: string | undefined): Action | undefined {
    if (!app || !actionId) return undefined
    return resolveOwnerFirst(app.actions, actionId, app.actionCatalogue)
}

/**
 * Where a shell flow's `Navigate` step goes, when it is a route OF THE APP: a path with no scheme
 * and no host (`orders/new`, `/orders/new`), relative to the mount like every `routes.yaml` route.
 * Answers the route without its leading slash, or undefined for a URL (`https://…`, `//host/…`,
 * `mailto:`), which still leaves the page the way a page flow's NavigateTo does.
 */
export function inAppRoute(destination: unknown): string | undefined {
    if (typeof destination !== 'string') return undefined
    const d = destination.trim()
    if (d.startsWith('//')) return undefined
    if (/^[a-z][a-z0-9+.-]*:/i.test(d)) return undefined
    return d.replace(/^\/+/, '')
}
