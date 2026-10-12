import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { html, LitElement, TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { MateuComponent } from "@infra/ui/mateu-component.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolate } from "@infra/ui/interpolation.ts";
import { sanitizeHtml } from "@infra/ui/safeHtml.ts";

const serialize = (e: any) => {
    if (e instanceof CustomEvent) {
        return e.detail
    }
    const result: Record<string, any> = {}
    for (const k in e) {
        const v = e[k]
        if (['number', 'string', 'boolean'].indexOf(typeof v) >= 0) {
            result[k] = e[k]
        }
    }
    return result
}

// An element's attributes and its content are the only channels it has for data, and they arrive
// as METADATA — the component tree, which a State update does not resend. So an attribute written
// as a literal is frozen as of the render that built it, which for a live view (a diagram of a
// running process, a gauge) means it silently stops following what it is showing. Written as a
// `${state.x}` expression it is a VALUE: state is what a State update carries, and every re-render
// re-evaluates it. Same idiom as every other label/title in the framework, so nothing new to learn.
//
// Single pass on purpose (`interpolate`, not `interpolateNested`): what travels this way is a
// payload — JSON, markup, a template meant for someone else's parser — and evaluating the RESULT
// would corrupt it, besides evaluating a string the server sent as data.
const resolve = (
    element: Element,
    state: ComponentState | undefined,
    data: ComponentData | undefined,
    appState: ComponentState | undefined,
    appData: ComponentData | undefined,
): { attributes: Record<string, string>, content: string | undefined } => {
    const extra = { appState: appState ?? {}, appData: appData ?? {} }
    const attributes: Record<string, string> = {}
    for (const k in element.attributes) {
        attributes[k] = interpolate(element.attributes[k], state, data, extra)
    }
    return { attributes, content: interpolate(element.content, state, data, extra) }
}

const hydrate = (
    htmlElement: any,
    element: Element,
    component: ClientSideComponent,
    resolved: { attributes: Record<string, string>, content: string | undefined },
) => {
    for (let k in resolved.attributes) {
        // setAttribute on the element that is already there, never a fresh one: a custom element
        // observing the attribute turns it into a property change and repaints, keeping whatever
        // it holds that the server knows nothing about — zoom, selection, a computed layout.
        htmlElement.setAttribute(k, resolved.attributes[k])
    }
    if (component.style) {
        htmlElement.setAttribute('style', component.style)
    }
    if (component.cssClasses) {
        htmlElement.setAttribute('class', component.cssClasses)
    }
    if (component.slot) {
        htmlElement.setAttribute('slot', component.slot)
    }
    if (resolved.content) {
        if (element.html) {
            // Markup written in the definition is trusted as is; once `${…}` has put DATA into
            // it, it is sanitized (no event handlers, scripts or javascript: URLs) — stored XSS.
            htmlElement.innerHTML = element.content?.includes('${')
                ? sanitizeHtml(resolved.content)
                : resolved.content
        } else {
            htmlElement.append(resolved.content)
        }
    }
}

const isAbsolute = (url: string) => /^https?:\/\//i.test(url)

/**
 * The origin of the REMOTE app that sent the screen `from` sits in, or undefined when the screen
 * is this app's own. Walks up the tree (crossing shadow roots) collecting the `baseUrl` of every
 * host that has one: the nearest non-empty one is the screen's backend, the outermost one is the
 * page's own (an empty base url means the page's origin). The screen is remote when its backend
 * is absolute and on another origin — what a federated shell's remote section is. A component
 * nested inside a remote screen (a tab's own server-side component) carries an empty base url of
 * its own; the `mateu-ux` above it knows.
 */
export const remoteOriginOf = (
    from: unknown,
    pageOrigin: string = globalThis.location?.origin ?? '',
): string | undefined => {
    const baseUrls: string[] = []
    let node = from as (Node & { baseUrl?: unknown }) | null
    for (let hops = 0; node && hops < 500; hops++) {
        if (typeof node.baseUrl === 'string') baseUrls.push(node.baseUrl)
        node = (node.parentNode ?? (node as unknown as ShadowRoot).host ?? null) as typeof node
    }
    const nearest = baseUrls.find((b) => b)
    if (!nearest || !isAbsolute(nearest)) return undefined
    const outermost = baseUrls[baseUrls.length - 1]
    try {
        const own = outermost && isAbsolute(outermost) ? new URL(outermost).origin : pageOrigin
        const remote = new URL(nearest).origin
        return remote !== own ? remote : undefined
    } catch {
        return undefined
    }
}

/**
 * Where an Element's `import` module really lives. A root-relative url (`/acme/graph.js`) means
 * "on the server that sent this screen" — which, for a screen a federated shell loaded from a
 * REMOTE app, is the remote's origin, not the shell's. Resolved against the page instead, it 404s
 * on the shell and the element never upgrades (a remote workflow console's diagram tab stayed
 * blank). Anything else — this app's own screens, an absolute or protocol-relative module url — is
 * left as is.
 *
 * The remote has to serve the module with CORS for the shell's origin: a module script is always
 * fetched in cors mode.
 */
export const moduleUrlFor = (moduleUrl: string, remoteOrigin?: string): string => {
    if (!remoteOrigin || !moduleUrl.startsWith('/') || moduleUrl.startsWith('//')) return moduleUrl
    return remoteOrigin + moduleUrl
}

// Third-party custom elements loaded on demand: an Element carrying an `import` attribute has its
// module loaded dynamically the first time the tag is used — the URL must be served by the app
// that sent the screen and define the custom element as a side effect. Custom elements upgrade in
// place once defined, so the element can be created before the module finishes loading.
// (Design-system bundles like @vaadin/charts are lazy-loaded by their own renderer/app, not from
// this core path.)
const ensureElementDefined = (element: Element, remoteOrigin?: string) => {
    const tagName = element.name
    const moduleUrl = element.attributes ? element.attributes['import'] : undefined
    if (moduleUrl && tagName.includes('-') && !customElements.get(tagName)) {
        import(/* @vite-ignore */ moduleUrlFor(moduleUrl, remoteOrigin))
    }
}

export const renderElement = (
    container: LitElement,
    element: Element,
    component: ClientSideComponent,
    state?: ComponentState,
    data?: ComponentData,
    appState?: ComponentState,
    appData?: ComponentData,
): TemplateResult => {
    ensureElementDefined(element, remoteOriginOf(container))
    const resolved = resolve(element, state, data, appState, appData)
    let selector = element.name
    if (resolved.attributes['id']) {
        selector = '#' + resolved.attributes['id']
    }
    // Each element gets its OWN container, addressed by the component id: every container carries
    // the same class, so a lookup by class alone finds the first one for all of them and a second
    // element on the same page hydrates inside — and then re-hydrates from — the first one's box.
    const containerSelector = component.id
        ? `.element-container[data-element-id="${component.id}"]`
        : '.element-container'
    setTimeout(() => {
        const elementContainer = container.shadowRoot?.querySelector(containerSelector)
        const htmlElement = elementContainer?.querySelector(selector)
        if (!htmlElement) {
            const htmlElement = document.createElement(element.name);
            hydrate(htmlElement, element, component, resolved)
            for (let k in element.on) {
                htmlElement.addEventListener(k, (e: Event) => {
                    const parameter = serialize(e)
                    const mateuComponent = container as MateuComponent
                    mateuComponent.manageActionRequestedEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: element.on[k],
                            parameters: {
                                event: parameter
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                })
            }
            elementContainer?.appendChild(htmlElement)
        } else {
            while (htmlElement.firstChild) {
                htmlElement.removeChild(htmlElement.lastChild!);
            }
            hydrate(htmlElement, element, component, resolved)
        }
    })
    return html`<div class="element-container" data-element-id="${ifDefined(component.id)}"></div>`
}