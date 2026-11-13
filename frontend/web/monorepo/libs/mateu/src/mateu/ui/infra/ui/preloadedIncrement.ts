import type UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import { upstream } from "@domain/state";
import { addReferencedRestSources } from "@infra/http/restSourceCatalogue.ts";
import { asAnsweredBy } from "@infra/ui/untrustedDefinition.ts";

/**
 * Paints an answer the host already fetched (a micro frontend it resolved, `resolve = SERVER`) as if
 * it were the answer to `initiator`'s own load: the same fragments through the same channel, with
 * the initiator's callback token. Only what paints the island arrives — the server leaves the
 * remote's commands, messages and app state out — and nothing else is done: its later actions go
 * to the island's own baseUrl, the remote.
 *
 * It keeps the trust the same answer would have had fetched by the browser (S12): from an origin
 * the app trusts (its own, a remote its menu declares) as the author wrote it, else through the
 * untrusted strip — the host fetching it does not make a less trusted remote's markup safer.
 */
export const applyPreloaded = (answer: UIIncrement, initiator: HTMLElement, callbackToken: string) => {
    const baseUrl = (initiator as HTMLElement & { baseUrl?: string }).baseUrl ?? initiator.getAttribute('baseurl') ?? ''
    const increment = asAnsweredBy(baseUrl, answer)
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
