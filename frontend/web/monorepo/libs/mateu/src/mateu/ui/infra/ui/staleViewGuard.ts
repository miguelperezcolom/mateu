/**
 * Whether an action a component asked for may still be sent through the `mateu-ux` it bubbled up to.
 *
 * <p>A `mateu-ux` sends every action of the view it shows to ITS OWN base url — the component only
 * says which view it is (its `serverSideType`), not which server owns that view. That is right as
 * long as the view on screen is the one the ux was asked for. It stops being right when Lit REUSES
 * the element for another page: a shell's content ux (or a nested app's) is the same element at the
 * same place in the template, and a navigation just re-binds its `id`, `baseUrl` and `route`. Until
 * the new page's structure lands, the components still under it are the OUTGOING page's, and
 * anything they fire in that window — the OnLoad `search` of a listing seeded from the structure
 * cache, a poll, a late trigger — leaves with the old page's `serverSideType` for the NEW page's
 * server. On a federated shell that is another app, which has never heard of the type: since the
 * wire-type allowlist it refuses it with a 403 (and before that it failed to instantiate it).
 * Live: Integrations → a front-office integration's detail → Registro sent the integrations
 * listing's `search` (FrontOfficeIntegrationCrud) to /_registration-rules.
 *
 * <p>The identity of what a ux shows is its id plus its base url (the id alone is route-derived and
 * the base url is what decides the server). The ux records the identity its content was produced
 * for — a fragment landing, or a structure seeded from the cache for the route it is loading — and
 * an action is only sent while that is still the ux's identity. The route load itself (actionId
 * '', fired by the ux) always goes: it is what replaces the stale content.
 */
export const uxIdentity = (id: string | undefined, baseUrl: string | undefined): string =>
    `${id ?? ''}|${baseUrl ?? ''}`

export const actionIsForCurrentView = (
    contentIdentity: string | undefined,
    currentIdentity: string,
    actionId: string | undefined,
): boolean => {
    // The route load replaces the content: it is never stale.
    if (!actionId) return true
    // Nothing recorded yet (nothing rendered through this ux): nothing to compare with.
    if (contentIdentity === undefined) return true
    return contentIdentity === currentIdentity
}
