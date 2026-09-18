import UICommand from '../../../shared/apiClients/dtos/UICommand.ts'

/**
 * A declared client-side flow (coherence-plan #3): an action can carry `commands` lowered on the
 * server from its fluent Steps. Because every v0 verb is exactly one existing wire command, running
 * the flow is just applying those commands with the component's own applier — no server round-trip.
 *
 * Kept as a pure function (no DOM, no `this`) so it is unit-testable and is the single place the
 * "does this action run client-side?" decision lives. Returns true when it handled the action (it
 * had a flow and the commands were applied), so the caller can short-circuit the server dispatch.
 */
export function runDeclaredFlow(
    action: { commands?: UICommand[] | undefined } | undefined,
    apply: (command: UICommand) => void,
): boolean {
    const commands = action?.commands
    if (commands && commands.length) {
        commands.forEach(apply)
        return true
    }
    return false
}
