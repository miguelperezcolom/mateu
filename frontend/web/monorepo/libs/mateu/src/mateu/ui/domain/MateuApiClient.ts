import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import { ComponentState } from "@infra/ui/renderers/types.ts";

/**
 * Per-call transport knobs. All optional: omitting the object keeps the historical behaviour
 * (the client's default timeout, no self-retry, no user-facing retry affordance).
 */
export interface RunActionOptions {
    /**
     * How long to wait for THIS action before giving up, in ms (`@Action(timeoutMillis = …)`).
     * A single global timeout cannot serve both a type-ahead lookup, which should give up in
     * seconds, and a report export, which may legitimately take minutes.
     */
    timeoutMillis?: number
    /**
     * Declared by the action: re-sending it cannot apply the same change twice, so the client
     * may retry it on a transient failure without asking.
     */
    idempotent?: boolean
    /**
     * Re-runs the whole action, handling the response as the original call would have. Offered
     * to the user as "Retry" when an action fails and cannot be retried automatically.
     */
    retry?: () => void
}

export interface MateuApiClient {

    runAction(baseUrl: string, route: string, consumedRoute: string,
              actionId: string,
              initiatorComponentId: string,
              appState: ComponentState | undefined,
              serverSideType: string | undefined,
              componentState: ComponentState | undefined,
              parameters: Record<string, unknown> | undefined,
              initiator: HTMLElement,
              background: boolean,
              options?: RunActionOptions): Promise<UIIncrement>

}
