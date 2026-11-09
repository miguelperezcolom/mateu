import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, LitElement, nothing, TemplateResult } from "lit";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { isNodeIdStamping, stampNodeId } from "@infra/ui/renderers/nodeIdStamp.ts";
import { guard } from "lit/directives/guard.js";

interface RoutedContainer extends LitElement {
    route: string
    consumedRoute: string
}

export const renderComponentInSlot = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, slot: string, labelAlreadyRendered: boolean | undefined): TemplateResult => {
    component.slot = slot
    return renderComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
}

/**
 * A server-side component styled as a centred column (`max-width: 900px; margin: auto` — the wizard
 * and form default) takes the width it is GIVEN, capped by its max-width. Without a width, the auto
 * margins switch off the flex stretch and the element shrinks to its content's MIN width — two form
 * columns side by side (~410px) — so on a 390px phone the second column was cut off at the edge and
 * the form never collapsed to one column (WCAG 1.4.10 Reflow; UX review W-V-REFLOW).
 */
export const serverSideStyle = (style?: string): string | undefined => {
    if (!style) return style
    const centred = /margin\s*:\s*(?:0\s+)?auto/.test(style) && /max-width\s*:/.test(style)
    const sized = /(^|[;\s])width\s*:/.test(style)
    return centred && !sized ? `width: 100%; box-sizing: border-box; ${pageColumnCap(style)}` : style
}

/**
 * The server's DEFAULT page column (`max-width:900px;margin: auto;` — ComponentTreeSupplier.style(),
 * the crud orchestrators, the .NET/Python envelopes) is a reading measure for a FORM. On a page the
 * content view resolved as full or edge (a listing, a board, a foldout) it capped everything at
 * 900px anyway, so the width rules never showed. The default cap becomes `--mateu-page-column-cap`,
 * which the content view sets to `none` for full/edge pages (mateu-ux styles).
 *
 * Only the default, recognised by being EXACTLY that style: a view that asks for a column itself —
 * `@Style(StyleConstants.CONTAINER)` (which adds `display: block`), any style with more in it, any
 * other max-width — keeps it on every page.
 */
export const pageColumnCap = (style: string): string =>
    isDefaultPageColumn(style)
        ? style.replace(/max-width\s*:\s*900px/, 'max-width: var(--mateu-page-column-cap, 900px)')
        : style

const DEFAULT_PAGE_COLUMN = 'max-width:900px;margin:auto'

/** Whether a style is the server's default page column (whitespace and a final `;` aside). */
export const isDefaultPageColumn = (style: string | undefined): boolean =>
    !!style && style.replace(/\s+/g, '').replace(/;+$/, '').toLowerCase() === DEFAULT_PAGE_COLUMN

/**
 * The style an envelope paints with. A YAML page (its content IS a `Form`) gets the server's default
 * column only when its ROUTE seeds it (state, data, actions — then it is served wrapped); unseeded it
 * is served bare and gets none. So one definition drew 900px wide on one route and the page's full
 * width on another. The definition decides, not the route: a YAML page never takes the default
 * column; a style it was given on purpose stays.
 */
export const envelopeStyleOf = (component: Component): string | undefined => {
    const style = (component as { style?: string }).style
    if (!isDefaultPageColumn(style)) return style
    const only = component.children?.length === 1 ? component.children[0] : undefined
    const isYamlForm = only?.type == ComponentType.ClientSide
        && (only as ClientSideComponent).metadata?.type == ComponentMetadataType.Form
    return isYamlForm ? undefined : style
}

// An empty state/data map stands for every other one: callers pass a fresh `{}` when there is none.
const EMPTY = {}
const orEmpty = (map: object | undefined) => map && Object.keys(map).length > 0 ? map : EMPTY

/**
 * The data a server-side component renders with: the host's, with the island's OWN on top. An
 * island delivered inside another page's answer (an EmbeddedView) has no fragment of its own, so
 * what its page would carry in the fragment's data (a lookup's `<field>-label`) travels with it —
 * without it a lookup showed the stored id instead of its label.
 */
export const islandDataOf = (component: Component, data: ComponentData): ComponentData => {
    const own = (component as ServerSideComponent).data
    return own && typeof own === 'object' ? { ...data, ...(own as ComponentData) } : { ...data }
}

export const renderComponent = (container: LitElement, component: Component, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered?: boolean | undefined): TemplateResult => {
    if (!component) {
        return html``;
    }
    if (component.type == ComponentType.ClientSide ) {
        const painted = componentRenderer.get()!.renderClientSideComponent(container, component as ClientSideComponent, baseUrl, state, data, appState, appData, labelAlreadyRendered)
        // the visual editor maps a canvas click back to its node through this id (editor only)
        return isNodeIdStamping() && component.id ? html`${stampNodeId(component.id, painted)}` : painted
    }
    const route = (container as RoutedContainer).route
    const consumedRoute = (container as RoutedContainer).consumedRoute
    // `.state` / `.data` are bound again only when what they are made of changed. Lit sets an object
    // property on EVERY render, so a parent re-rendering for a reason of its own — a content mateu-ux
    // does when its route changes, while the next screen is still on its way — handed the child a
    // copy of its seed and dropped everything it had loaded itself (a record page's REST data): the
    // outgoing screen repainted with its fields blank for the length of the request, the previous
    // page "as configured" flashing before the next one.
    const seed = component.initialData as Record<string, unknown> | undefined
    return html`
        <mateu-component id="${component.id}"
                         .component="${component}"
                        route="${route}"
                         consumedRoute="${consumedRoute}"
                         baseUrl="${baseUrl}"
                         slot="${component.slot??nothing}"
                         style="${serverSideStyle(envelopeStyleOf(component))}"
                         class="${component.cssClasses}"
                         .state="${guard([component, seed, orEmpty(state)], () => ({...(seed ?? {}), ...state}))}"
                         .data="${guard([component, orEmpty(data)], () => islandDataOf(component, data))}"
                         .appState="${appState}"
                         .appData="${appData}"
        >
       </mateu-component>`
}
