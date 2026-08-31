/**
 * The componentState to POST for an action, given the acting component's own state and the action's
 * parameters. When a descendant originated the action and bubbled it up (e.g. a @ViewToolbarButton
 * on a crud's detail view, whose action is declared on the crud host, not on the form), it carries
 * its OWN state in parameters.initiatorState. That originating state — the form the button lives on,
 * WITH its id — is what the server's getComponentState(EntityType.class) must see; the ancestor's
 * own state (the crud list: filters/paging, no id) is not. So prefer the initiatorState when
 * present. Mirrors what the CSS-renderer shell (MateuRendererApp.handleUnhandledAction) already
 * does, making every renderer consistent. A direct (non-bubbled) action has no initiatorState, so
 * its own state is used unchanged.
 */
export const resolveComponentState = (
    ownState: Record<string, unknown> | undefined,
    parameters: Record<string, unknown> | undefined,
): Record<string, unknown> => {
    const initiatorState = parameters?.['initiatorState']
    if (initiatorState && typeof initiatorState === 'object') {
        return { ...(initiatorState as Record<string, unknown>) }
    }
    return { ...(ownState ?? {}) }
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