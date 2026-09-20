import type Component from '@mateu/shared/apiClients/dtos/Component'

/**
 * The app's business-component catalogue, client side (coherence-plan #13) — the twin of
 * restSourceCatalogue, one level up: a source names an endpoint, a business component names a bound
 * composition of existing components.
 *
 * A `ComponentRef` carries only a NAME, so the composition has to be looked up here before it can be
 * rendered. It is app-wide (not per-screen) and fed by whichever arrives — the app metadata (live
 * backend) or the static bundle's manifest (no backend); whichever it is, it REPLACES the catalogue,
 * because a stale entry surviving a deployment change is the failure the indirection removes.
 *
 * A reference the catalogue does not carry resolves to nothing here; the caller renders a graceful
 * placeholder rather than a broken screen (matching the server's behaviour).
 */

interface ComponentEntry {
    name: string
    component: Component
}

let entries: ComponentEntry[] = []

/** Replaces the catalogue. Called when app metadata or a bundle manifest arrives. */
export const setComponentCatalogue = (incoming: ComponentEntry[] | undefined): void => {
    entries = Array.isArray(incoming) ? incoming : []
}

/** The composition this name stands for, or undefined when the catalogue does not carry it. */
export const resolveComponent = (name: string | undefined): Component | undefined =>
    name ? entries.find((entry) => entry.name === name)?.component : undefined

/** Everything currently in the catalogue — for diagnostics and tests. */
export const componentCatalogue = (): ComponentEntry[] => entries
