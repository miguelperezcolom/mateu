import UICommand from '../../../shared/apiClients/dtos/UICommand.ts'

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
    app: { actions?: { id?: string, commands?: UICommand[] | undefined }[] | undefined } | undefined,
    actionId: string | undefined,
): UICommand[] | undefined {
    if (!app || !actionId || !Array.isArray(app.actions)) return undefined
    const action = app.actions.find((a) => a && a.id === actionId)
    return action?.commands && action.commands.length ? action.commands : undefined
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
