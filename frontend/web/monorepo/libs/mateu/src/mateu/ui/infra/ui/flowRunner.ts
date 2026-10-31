import UICommand from '../../../shared/apiClients/dtos/UICommand.ts'
import { ComponentData, ComponentState } from './renderers/types.ts'
import { interpolateUrl } from './interpolation.ts'

/**
 * What a flow's placeholders read: the firing component's `state` and `data` — with the action's
 * PARAMETERS on top of the state (a map marker's `_markerId`, a clicked event's id), so
 * `${state._markerId}` names what was clicked — plus `appState`/`appData`.
 */
export interface FlowContext {
    state?: ComponentState
    data?: ComponentData
    parameters?: Record<string, unknown>
    appState?: ComponentState
    appData?: ComponentData
}

/**
 * A step's command with its placeholders resolved. A `Navigate` route is a URL: it is interpolated
 * like a source url (`interpolateUrl` — a value is encoded as a path segment or a query component,
 * and a dot segment is refused), so `route: missions/${state._markerId}` opens the clicked record.
 * It used to navigate to the literal text. Commands without a `${` pass through untouched.
 */
export function resolveFlowCommand(command: UICommand, context?: FlowContext): UICommand {
    if (!context || command?.type !== 'NavigateTo' || typeof command.data !== 'string' || !command.data.includes('${')) {
        return command
    }
    const state = { ...(context.state ?? {}), ...(context.parameters ?? {}) }
    const route = interpolateUrl(command.data, state, context.data ?? {}, {
        appState: context.appState ?? {},
        appData: context.appData ?? {},
    })
    return { ...command, data: route }
}

/**
 * A declared client-side flow (coherence-plan #3): an action can carry `commands` lowered on the
 * server from its fluent Steps. Because every v0 verb is exactly one existing wire command, running
 * the flow is just applying those commands with the component's own applier — no server round-trip.
 *
 * Kept as a pure function (no DOM, no `this`) so it is unit-testable and is the single place the
 * "does this action run client-side?" decision lives. Returns true when it handled the action (it
 * had a flow and the commands were applied), so the caller can short-circuit the server dispatch.
 * With a `context`, each command's placeholders are resolved first ({@link resolveFlowCommand}).
 */
export function runDeclaredFlow(
    action: { commands?: UICommand[] | undefined } | undefined,
    apply: (command: UICommand) => void,
    context?: FlowContext,
): boolean {
    const commands = action?.commands
    if (commands && commands.length) {
        commands.forEach((command) => apply(resolveFlowCommand(command, context)))
        return true
    }
    return false
}
