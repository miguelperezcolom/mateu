/**
 * An `action-requested` that bubbles all the way up to <mateu-ui> was claimed by NO component on
 * the way: no mateu-component advertises that action id, so nothing will run and the click is
 * silently lost (a renamed method, an id the server does not advertise, a typo in a YAML
 * actionId). The root says so in the console, naming the id — a dead control was invisible
 * before (UX review W-V-UNCLAIMED).
 */
export const unclaimedActionWarning = (detail: { actionId?: unknown } | null | undefined): string | null => {
    const id = detail && typeof detail.actionId === 'string' ? detail.actionId : null
    if (!id) return null
    return `[mateu] action "${id}" was requested but no component on the page handles it — `
        + 'check that the view declares it (a public method / @Action / the actions list) and that the id is spelled the same.'
}
