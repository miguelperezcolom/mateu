import type UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import { upstream } from "@domain/state";
import { addReferencedRestSources } from "@infra/http/restSourceCatalogue.ts";

/**
 * Paints an answer the host already fetched (a micro frontend it resolved, `resolve = SERVER`) as if
 * it were the answer to `initiator`'s own load: the same fragments through the same channel, with
 * the initiator's callback token. Only what paints the island arrives — the server leaves the
 * remote's commands, messages and app state out — and nothing else is done: its later actions go
 * to the island's own baseUrl, the remote.
 */
export const applyPreloaded = (increment: UIIncrement, initiator: HTMLElement, callbackToken: string) => {
    addReferencedRestSources(increment?.restSources)
    increment?.fragments?.forEach(fragment => {
        upstream.next({
            command: undefined,
            fragment,
            ui: undefined,
            error: undefined,
            callbackToken,
            initiator,
        })
    })
}
