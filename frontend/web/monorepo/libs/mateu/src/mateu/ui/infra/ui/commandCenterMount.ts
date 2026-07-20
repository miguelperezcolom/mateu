import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import type { MateuCommandCenter } from "@infra/ui/mateu-command-center.ts";
import "@infra/ui/mateu-command-center.ts";

/**
 * Mounts the shared command-center element (the Ask-Oracle FAB + full-screen palette) into an app
 * shell's shadow root, imperatively, from the shell's `updated()` lifecycle. Every shell — whether it
 * renders via the shared appRenderer (Vaadin) or its own `render()` (Redwood, SAP UI5) — inherits one
 * of the two base classes (MateuApp / MateuRendererApp), so calling this from their `updated()` covers
 * ALL of them from ONE place, with no per-shell template surgery.
 *
 * Why the shadow root and not document.body: the command center navigates by dispatching the
 * `route-changed` / `navigate-to-requested` pair, which mateu-ui / mateu-ux listen for on THEMSELVES
 * (element-scoped, not on document). The events are `composed`, so as long as the element lives inside
 * the shell's tree they bubble up through the shell host to mateu-ui; a document.body sibling would be
 * out of that ancestor chain and navigation would silently do nothing.
 *
 * The element is appended once as a trailing sibling of Lit's rendered content (Lit only manages the
 * range it created, so the appended node survives re-renders) and its `.app` / `.baseUrl` are re-synced
 * on every update so it follows navigation.
 */
// Document-wide singleton: several app shells can be alive at once (e.g. redwood-oj nests a MEDIATOR
// shell per crud), and each runs updated(); without a singleton every shell would mount its own FAB
// and every ⌘K would open several overlapping overlays. The first shell that wants it owns the one
// element; other shells only refresh its props.
let current: MateuCommandCenter | null = null

export function syncCommandCenter(host: { renderRoot: ParentNode; component: unknown; baseUrl?: string }): void {
    const md = (host.component as ClientSideComponent | undefined)?.metadata as App | undefined
    // Skip embedded MEDIATOR shells — they are not top-level apps.
    const want = !!(md && (md.commandCenterEnabled || md.chromeless) && md.variant !== 'MEDIATOR')
    if (want) {
        if (!current || !current.isConnected) {
            current = document.createElement('mateu-command-center') as MateuCommandCenter
            host.renderRoot.appendChild(current)
        }
        current.app = md
        current.baseUrl = host.baseUrl ?? ''
    } else if (current && host.renderRoot.contains(current)) {
        // the owning shell turned it off (e.g. chromeless → normal)
        current.remove()
        current = null
    }
}
