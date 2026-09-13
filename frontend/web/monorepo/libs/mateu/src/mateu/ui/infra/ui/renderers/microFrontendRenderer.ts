import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import MicroFrontend from "@mateu/shared/apiClients/dtos/componentmetadata/MicroFrontend";
import { html, nothing } from "lit";

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

export const renderMicroFrontend = (component: ClientSideComponent) => {
    const metadata = component.metadata as MicroFrontend

    return html`
        <mateu-api-caller>
        <mateu-ux baseUrl="${metadata.baseUrl}"
                  route="${metadata.route}"
                  consumedRoute="${metadata.consumedRoute}"
                  id="${microFrontendUxId(metadata)}"
                  serverSideType="${metadata.serverSideType}"
                  .appState="${metadata.appState}"
                  style="${component.style}" class="${component.cssClasses}"
                  slot="${component.slot??nothing}"
        ></mateu-ux>
        </mateu-api-caller>
            `
}
