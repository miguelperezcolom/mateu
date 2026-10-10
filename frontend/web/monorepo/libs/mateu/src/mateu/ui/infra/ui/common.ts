/**
 * The componentState to POST for an action, given the acting component's own state and the action's
 * parameters. When a descendant originated the action and bubbled it up (e.g. a @ViewToolbarButton
 * on a crud's detail view, whose action is declared on the crud host, not on the form), it carries
 * its OWN state in parameters.initiatorState. That originating state — the form the button lives on,
 * WITH its id — is what the server's getComponentState(EntityType.class) must see; the ancestor's
 * own state (the crud list: filters/paging, no id) is not. So prefer the initiatorState when
 * present. Mirrors what the app shell already
 * does, making every renderer consistent. A direct (non-bubbled) action has no initiatorState, so
 * its own state is used unchanged.
 */
export const resolveComponentState = (
    ownState: Record<string, unknown> | undefined,
    parameters: Record<string, unknown> | undefined,
    actionId?: string,
): Record<string, unknown> => {
    const initiatorState = parameters?.['initiatorState']
    if (initiatorState && typeof initiatorState === 'object' && !isOwnListAction(ownState, actionId)) {
        return { ...(initiatorState as Record<string, unknown>) }
    }
    return { ...(ownState ?? {}) }
}

/** The actions a list field's row editor sends to the form that holds the list: `rooms_create`… */
const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/

/**
 * A list field's action — the row editor's Save, Cancel, Next… bubbled up to the form that holds the
 * list. There the exception to the rule above: the list, and everything around it, is in the
 * HOLDER's state, and the edited row already rides in parameters.initiatorState, which is where the
 * server reads it from. Posting the row as the componentState rebuilt the holder from a room — a
 * wizard went back to its first step, empty, and a form kept only the new row. The holder is known by
 * the `<field>_rowClass` its state carries for each of its lists.
 */
export const isOwnListAction = (ownState: Record<string, unknown> | undefined, actionId: string | undefined): boolean => {
    const match = actionId ? LIST_ACTION.exec(actionId) : null
    return !!match && !!ownState && `${match[1]}_rowClass` in ownState
}

export const parseOverrides = (overrides: string | undefined) => {
    if (overrides) {
        try {
            return JSON.parse(overrides)
        } catch (exception) {
            return {
                value: overrides
            }
        }
    } else {
        return {}
    }
}