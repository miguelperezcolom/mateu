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
    ComponentMetadataType.WorkflowElk,
    ComponentMetadataType.Map,
])

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

/**
 * Resolves the page width a routed view gets (the first parameter of the Oracle Redwood page
 * templates): a width declared on the server-side component — or on its Page metadata — wins;
 * with no declaration the width is inferred from the content tree: full-bleed components
 * (gantt, planning board, kanban, bpmn/workflow, map) → edge; a dense datagrid (inline editing
 * or compact crud) → full; anything else → fixed.
 */
export const resolvePageWidth = (component: Component | undefined): ResolvedPageWidth => {
    if (!component) return 'fixed'
    const declared = wireToMode((component as ServerSideComponent).pageWidth) ?? declaredInTree(component)
    if (declared) return declared
    if (contains(component, node => {
        const type = metadataOf(node)?.type
        return type != undefined && FULL_BLEED_TYPES.has(type)
    })) return 'edge'
    if (contains(component, isDenseCrud)) return 'full'
    return 'fixed'
}
