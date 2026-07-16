import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient.ts";
import { sseService } from "@application/SSEService.ts";

/**
 * Dispatch logic for app-header actions (App.contextActions), shared by ALL the app shells
 * (Vaadin appRenderer + the DS-native sapui5/redhat/redwood/slds shells) so the wire contract
 * stays identical: a header action always dispatches against the APP class (same rail as the
 * @AppContext pickers' remote search) — never against the on-screen component.
 *
 * The on-screen mateu-component is still the INITIATOR: streamed fragments (e.g. a LongTask's
 * progress dialog) are addressed to the initiator's id, and only a REAL component adopts and
 * renders them — so we pierce shadow roots from the shell's render root to find it.
 *
 * Throws on failure so each shell can show the error toast in its own design system's idiom.
 */
const findComponent = (root: Element | ShadowRoot | DocumentFragment | null): HTMLElement | null => {
    if (!root || !('querySelectorAll' in root)) return null
    for (const el of root.querySelectorAll('*')) {
        if (el.tagName?.toLowerCase() === 'mateu-component') return el as HTMLElement
        const nested = findComponent((el as HTMLElement).shadowRoot)
        if (nested) return nested
    }
    return null
}

export const dispatchAppHeaderAction = async (
    metadata: App,
    container: HTMLElement & { baseUrl?: string },
    actionId: string,
): Promise<void> => {
    const root = ((container as unknown as { renderRoot?: Element | ShadowRoot }).renderRoot ?? container) as Element | ShadowRoot
    const comp = findComponent(root)
    // The SSE flavor: a server action returning a Flux streams one UIIncrement per element,
    // so long pipelines (deploy…) update their dialog as they happen.
    await sseService.runAction(
        mateuApiClient,
        container.baseUrl ?? '',
        metadata.rootRoute || '_no_route',
        '',
        actionId,
        comp?.id ?? 'app-header-action',
        {},
        metadata.serverSideType ?? '',
        {},
        {},
        comp ?? container,
        true,
        undefined,
        false,
        ''
    )
}
