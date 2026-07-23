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
])

/** Width default by coarse page type (the Redwood template families): decisive only where the
 * family consensus is strong — form/process/landing pages are always capped. Collection, detail
 * and dashboard pages defer to the content inference (dense → full, full-bleed → edge). */
const PAGE_TYPE_DEFAULT_WIDTH: Record<string, ResolvedPageWidth | undefined> = {
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
    return find(component)
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
const isAppShell = (component: Component): boolean => {
    if (metadataOf(component)?.type == ComponentMetadataType.App) return true
    return (component.children ?? [])
        .some(child => metadataOf(child)?.type == ComponentMetadataType.App)
}

/**
 * Resolves the page width a routed view gets (the first parameter of the Oracle Redwood page
 * templates): a width declared on the server-side component — or on its Page metadata — wins;
 * a TOP-LEVEL App shell is always edge (its pages apply their own width inside — mediator pages
 * carry an App reference child but are NOT shells, so the shell rule needs the `top` flag); the
 * coarse page type anchors the default (form/process/landing are always capped); with no
 * declaration the width is inferred from the content tree: full-bleed components
 * (gantt, planning board, kanban, bpmn/workflow, map) → edge; a dense datagrid (inline editing
 * or compact crud) → full; anything else → fixed.
 */
export const resolvePageWidth = (component: Component | undefined, opts?: { top?: boolean }): ResolvedPageWidth => {
    if (!component) return 'fixed'
    const declared = wireToMode((component as ServerSideComponent).pageWidth) ?? declaredInTree(component)
    if (declared) return declared
    if (opts?.top && isAppShell(component)) return 'edge'
    const typeDefault = PAGE_TYPE_DEFAULT_WIDTH[pageTypeOf(component) ?? '']
    if (typeDefault) return typeDefault
    if (contains(component, node => {
        const type = metadataOf(node)?.type
        return type != undefined && FULL_BLEED_TYPES.has(type)
    })) return 'edge'
    if (contains(component, isDenseCrud)) return 'full'
    return 'fixed'
}
