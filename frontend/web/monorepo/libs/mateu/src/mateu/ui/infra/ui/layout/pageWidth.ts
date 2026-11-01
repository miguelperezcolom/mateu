import Component from "@mateu/shared/apiClients/dtos/Component";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import {ComponentType} from "@mateu/shared/apiClients/dtos/ComponentType";
import {ComponentMetadataType} from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";

/** Resolved page-width mode — the values the renderer paints (data-page-width). */
export type ResolvedPageWidth = 'fixed' | 'full' | 'edge'

/** Wire names emitted by the backend (PageWidthResolver on the Java side) → resolved mode. */
const WIRE_TO_MODE: Record<string, ResolvedPageWidth> = {
    fixed: 'fixed',
    fullWidth: 'full',
    edgeToEdge: 'edge',
}

/** Content that manages its own gutters and wants the whole viewport width. */
const FULL_BLEED_TYPES: ReadonlySet<ComponentMetadataType> = new Set([
    ComponentMetadataType.Gantt,
    ComponentMetadataType.PlanningBoard,
    ComponentMetadataType.Kanban,
    ComponentMetadataType.Bpmn,
    ComponentMetadataType.Workflow,
    ComponentMetadataType.Map,
    // a foldout's panels unfold sideways: squeezed into the fixed column they could not
    ComponentMetadataType.FoldoutLayout,
])

/** Width default by coarse page type (the Redwood template families). Collection and dashboard
 * pages are about their data, which wants the room: full. Form, process and landing pages are read
 * line by line and stay capped: fixed. Detail pages defer to their content. (Owner decision
 * 2026-11-01: listings and boards at a fixed 1200px truncated their last columns.) */
const PAGE_TYPE_DEFAULT_WIDTH: Record<string, ResolvedPageWidth | undefined> = {
    collection: 'full',
    dashboard: 'full',
    landing: 'fixed',
    form: 'fixed',
    process: 'fixed',
}

const wireToMode = (pageWidth: string | undefined | null): ResolvedPageWidth | undefined =>
    pageWidth ? WIRE_TO_MODE[pageWidth] : undefined

const metadataOf = (node: Component) =>
    node.type == ComponentType.ClientSide ? (node as ClientSideComponent).metadata : undefined

/** First page width declared on a Page metadata in the tree, depth-first. */
const declaredInTree = (node: Component): ResolvedPageWidth | undefined => {
    const metadata = metadataOf(node)
    if (metadata?.type == ComponentMetadataType.Page) {
        const mode = wireToMode((metadata as PageComponent).pageWidth)
        if (mode) return mode
    }
    for (const child of node.children ?? []) {
        const mode = declaredInTree(child)
        if (mode) return mode
    }
    return undefined
}

/** The view's coarse page type (wrapper first, then a Page metadata in the tree). */
export const pageTypeOf = (component: Component): string | undefined => {
    const fromWrapper = (component as ServerSideComponent).pageType
    if (fromWrapper) return fromWrapper
    const find = (node: Component): string | undefined => {
        const metadata = metadataOf(node)
        if (metadata?.type == ComponentMetadataType.Page && (metadata as PageComponent).pageType) {
            return (metadata as PageComponent).pageType
        }
        for (const child of node.children ?? []) {
            const found = find(child)
            if (found) return found
        }
        return undefined
    }
    return find(component) ?? bareFormPageTypeOf(component)
}

/**
 * The page type of a route whose content IS a `Form` (a YAML page served bare, with no envelope to
 * carry a page type): the kind of page its `template:` stands for — the same table as the server's
 * PageTypeResolver.ofTemplate — or `form`.
 */
const bareFormPageTypeOf = (component: Component): string | undefined => {
    let node: Component | undefined = component
    while (node && node.type == ComponentType.ServerSide && (node.children ?? []).length === 1) {
        node = node.children![0]
    }
    const metadata = node ? metadataOf(node) : undefined
    if (metadata?.type != ComponentMetadataType.Form) return undefined
    const template = (metadata as unknown as { template?: { type?: string } }).template?.type
    return template ? (TEMPLATE_PAGE_TYPES[template] ?? 'form') : 'form'
}

const TEMPLATE_PAGE_TYPES: Record<string, string> = {
    CollectionDetailPage: 'collection',
    DataManagementPage: 'collection',
    DashboardLandingPage: 'dashboard',
    WelcomePage: 'landing',
    HeroSearchPage: 'landing',
    ItemOverviewPage: 'detail',
    GeneralOverviewPage: 'detail',
    FoldoutPage: 'detail',
    MultimediaContentPage: 'detail',
    GuidedProcessPage: 'process',
    AdvancedCreateEditPage: 'form',
}

/** A crud is dense when it edits inline (editable columns) or packs its rows (compact). */
const isDenseCrud = (node: Component): boolean => {
    const metadata = metadataOf(node)
    if (metadata?.type != ComponentMetadataType.Crud) return false
    const crud = metadata as Crud
    if (crud.compact) return true
    return (crud.columns ?? [])
        .some(col => ((col as ClientSideComponent).metadata as GridColumn)?.editable)
}

const contains = (node: Component, predicate: (node: Component) => boolean): boolean =>
    predicate(node) || (node.children ?? []).some(child => contains(child, predicate))

/** Whether the page carries a welcome banner (a HeroSection anywhere in the content) — in the
 * Redwood anatomy the accent color strip only shows on pages WITHOUT one. */
export const hasWelcomeBanner = (component: Component | undefined): boolean =>
    !!component && contains(component, node => metadataOf(node)?.type == ComponentMetadataType.HeroSection)

/** An App shell always takes the whole viewport (global header/nav/footer are full-bleed in the
 * RDS app anatomy) — the template width applies to the pages mounted INSIDE it. */
export const isAppShell = (component: Component): boolean => {
    if (metadataOf(component)?.type == ComponentMetadataType.App) return true
    return (component.children ?? [])
        .some(child => metadataOf(child)?.type == ComponentMetadataType.App)
}

/**
 * Resolves the page width a routed view gets (the first parameter of the Oracle Redwood page
 * templates), first rule that answers wins:
 *  1. a width DECLARED on the server-side component or its Page metadata (a form page declared
 *     edge-to-edge gets full: a crud's editor shares its class, and so its declared width, with the
 *     detail page whose foldout panels wanted the edges);
 *  2. a TOP-LEVEL App shell → edge (its pages apply their own width inside — mediator pages carry an
 *     App reference child but are NOT shells, so the shell rule needs the `top` flag);
 *  3. full-bleed content anywhere in the tree (gantt, planning board, kanban, bpmn/workflow, map,
 *     foldout) → edge, except on a FORM page, which never bleeds: full (a YAML page with no template
 *     is a form page, and a board on it still wants the width);
 *  4. the coarse page type: collection / dashboard → full; form / process / landing → fixed (a
 *     bare listing route, a Crud with no page type around it, is a collection);
 *  5. a dense datagrid (inline editing or compact crud) → full;
 *  6. fixed.
 */
export const resolvePageWidth = (component: Component | undefined, opts?: { top?: boolean }): ResolvedPageWidth => {
    if (!component) return 'fixed'
    const pageType = pageTypeOf(component) ?? (isBareListing(component) ? 'collection' : undefined)
    const declared = wireToMode((component as ServerSideComponent).pageWidth) ?? declaredInTree(component)
    if (declared) return declared === 'edge' && pageType === 'form' ? 'full' : declared
    if (opts?.top && isAppShell(component)) return 'edge'
    if (contains(component, node => {
        const type = metadataOf(node)?.type
        return type != undefined && FULL_BLEED_TYPES.has(type)
    })) return pageType === 'form' ? 'full' : 'edge'
    const typeDefault = PAGE_TYPE_DEFAULT_WIDTH[pageType ?? '']
    if (typeDefault) return typeDefault
    if (contains(component, isDenseCrud)) return 'full'
    return 'fixed'
}

/** A route whose whole content IS a listing (a YAML `type: Listing` page), bare or in its envelope. */
const isBareListing = (component: Component): boolean => {
    let node: Component | undefined = component
    while (node && node.type == ComponentType.ServerSide && (node.children ?? []).length === 1) {
        node = node.children![0]
    }
    return !!node && metadataOf(node)?.type == ComponentMetadataType.Crud
}
