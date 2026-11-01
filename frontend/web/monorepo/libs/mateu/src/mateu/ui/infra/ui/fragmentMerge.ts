import type UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";

type Dict = Record<string, unknown>

const same = (a: unknown, b: unknown): boolean => {
    if (a === b) return true
    try {
        return JSON.stringify(a) === JSON.stringify(b)
    } catch {
        return false
    }
}

/** Whether `incoming` changes nothing of `current` once the seed (the component's initialData) is under both. */
const changesNothing = (current: Dict, incoming: Dict, seed: Dict): boolean => {
    for (const key of Object.keys(incoming)) {
        const before = key in current ? current[key] : seed[key]
        if (!same(before, incoming[key])) return false
    }
    return true
}

/**
 * The fragment on screen with the state and data of a reply that brings no structure of its own —
 * a state-only reply to a load whose structure the client already painted (the route structure
 * cache), or an authoritative answer identical to that prediction.
 *
 * <p><b>The state and data objects are kept as they are when the reply changes nothing</b>, and
 * that is the point of it. renderComponent re-binds a child's `.state`/`.data` only when the object
 * it is built from changes identity; a merge made a new one every time, so the child was handed its
 * seed again and dropped what it had loaded itself — a record page's REST data, fetched by its
 * OnLoad while the reply was on its way. The OnLoad had already fired, so nothing refilled it: the
 * detail of a collection-detail page painted, then went blank for good when revisited.
 */
export function mergeOntoScreen(onScreen: UIFragment, reply: Pick<UIFragment, 'state' | 'data'>): UIFragment {
    const seed = ((onScreen.component as { initialData?: Dict } | undefined)?.initialData ?? {}) as Dict
    const state = (onScreen.state ?? {}) as Dict
    const data = (onScreen.data ?? {}) as Dict
    const incomingState = (reply.state ?? {}) as Dict
    const incomingData = (reply.data ?? {}) as Dict
    const stateUnchanged = changesNothing(state, incomingState, seed)
    const dataUnchanged = changesNothing(data, incomingData, {})
    if (stateUnchanged && dataUnchanged) return onScreen
    return {
        ...onScreen,
        state: stateUnchanged ? onScreen.state : { ...state, ...incomingState },
        data: dataUnchanged ? onScreen.data : { ...data, ...incomingData },
    }
}
