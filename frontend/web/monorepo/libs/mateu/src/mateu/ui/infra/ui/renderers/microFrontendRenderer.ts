import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MicroFrontend from "@mateu/shared/apiClients/dtos/componentmetadata/MicroFrontend";
import { html, nothing } from "lit";
import { chromeOf } from "@infra/ui/embeddedChrome.ts";

/**
 * A STABLE id for the embedded micro-frontend's mateu-ux, derived from what it points at (base url +
 * route + consumed route + server-side type) rather than a fresh {@code nanoid()} per render.
 *
 * <p>A random id regenerated on every render means that every time the shell re-renders — and a
 * shell fronting remote menus re-renders several times on a cold load, as {@code completeMenu}
 * resolves the remotes and the active app's root returns a {@code component: null} routing hop that
 * pushes those re-renders past first paint — mateu-ux.updated() sees its {@code id} change and
 * treats it as a fresh navigation: it re-LOADS the route (a non-background request, so the loading
 * veil comes on) over content already on screen. That is the "page loads, then dims, then comes
 * back" flash, most visible on an embedded widget that also polls (the tasks widget). A
 * deterministic id makes successive renders reuse the same mateu-ux, so a shell re-render no longer
 * reloads it. Same fix, same reasoning as {@code contentUxId} for the content ux.
 */
export const microFrontendUxId = (metadata: MicroFrontend): string =>
    'mfe_' + [metadata.baseUrl, metadata.route, metadata.consumedRoute, metadata.serverSideType]
        .map(part => part ?? '')
        .join('|')
        .replace(/[^a-zA-Z0-9]/g, '_')

/**
 * The consumed route the island's loads carry: the declared one, else "" — a CONTENT load. Never
 * absent: a missing consumed route reaches the server as a FRESH load ("_empty"), which a remote APP
 * answers with its shell aimed at the route, and that shell, painted inside the island, loads
 * "_empty" + route and gets another shell, forever. The host resolving the island (resolve = SERVER)
 * asks the remote with the same value (MicroFrontendServerResolver.consumedRouteOf), so the answer it
 * embeds is the one this island would have fetched itself.
 */
export const microFrontendConsumedRoute = (metadata: MicroFrontend): string =>
    metadata.consumedRoute ?? ''

export const renderMicroFrontend = (component: ClientSideComponent) => {
    const metadata = component.metadata as MicroFrontend

    return html`
        <mateu-api-caller inline-failures>
        <mateu-ux baseUrl="${metadata.baseUrl}"
                  route="${metadata.route}"
                  consumedRoute="${microFrontendConsumedRoute(metadata)}"
                  id="${microFrontendUxId(metadata)}"
                  serverSideType="${metadata.serverSideType}"
                  .appState="${metadata.appState}"
                  .preloaded="${metadata.resolved}"
                  embedded-chrome="${chromeOf(metadata.chrome) ?? nothing}"
                  micro-frontend
                  style="${component.style}" class="${component.cssClasses}"
                  slot="${component.slot??nothing}"
        ></mateu-ux>
        </mateu-api-caller>
            `
}
