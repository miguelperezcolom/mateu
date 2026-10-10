import { html, nothing, type TemplateResult } from "lit";
import { directive, Directive, PartType, type ChildPart, type PartInfo } from "lit/directive.js";

/**
 * Editor-only: stamp every painted component's root element with the id of the wire component it
 * was painted from, as `data-node-id`.
 *
 * The visual editor maps a click on its canvas back to the definition node under it through that id
 * (it stamps a synthetic `ve-<path>` id on every node before rendering). Only SOME renderers write
 * `id="${component.id}"` on their root element — a hero, a dashboard panel, a metric card, a
 * scoreboard did not — so a click on them fell through to the nearest stamped ancestor (often the
 * page root) and the node could never be selected from the canvas. Rather than teaching ~100
 * renderers (and every design system's overrides) to do it, {@link renderComponent} wraps what a
 * renderer returns in {@link stampNodeId} when stamping is on, and the directive tags the first
 * element the renderer painted. OFF by default: a production page never carries editor ids.
 */
let stamping = false

export const setNodeIdStamping = (on: boolean): void => { stamping = on }
export const isNodeIdStamping = (): boolean => stamping

/**
 * For a renderer that paints a child component ITSELF instead of through renderComponent (a tab's
 * header, an accordion panel, a foldout panel, a form's button): the value of its `data-node-id`
 * attribute — the child's id while stamping, `nothing` (no attribute) otherwise.
 */
export const nodeIdAttr = (component: { id?: string } | undefined): string | typeof nothing =>
    stamping && component?.id ? component.id : nothing

/** The first element among the nodes a child part rendered (between its markers). */
export const firstElementOfPart = (part: Pick<ChildPart, 'startNode' | 'endNode' | 'parentNode'>): Element | null => {
    let node: Node | null = part.startNode ? part.startNode.nextSibling : part.parentNode?.firstChild ?? null
    while (node && node !== part.endNode) {
        if (node.nodeType === 1) return node as Element
        node = node.nextSibling
    }
    return null
}

class StampNodeId extends Directive {
    constructor(info: PartInfo) {
        super(info)
        if (info.type !== PartType.CHILD) throw new Error('stampNodeId only works in a child position')
    }

    render(_id: string, content: unknown) {
        return content
    }

    update(part: ChildPart, [id, content]: [string, unknown]) {
        // The content commits right after this returns; tag it once it is in place. Nested
        // components queue after their parent, so when a renderer's root IS another component's
        // root the INNERMOST id wins — a click selects the most specific node.
        queueMicrotask(() => {
            const el = firstElementOfPart(part)
            if (el && el.getAttribute('data-node-id') !== id) el.setAttribute('data-node-id', id)
        })
        return content
    }
}

export const stampNodeId = directive(StampNodeId)

/**
 * The id a page/form button is painted with: its action id — or, in the editor's preview, the node
 * id the button was authored with, so a click on it selects it.
 */
export const buttonId = (button: { id?: unknown, actionId?: string }): string | undefined =>
    stamping && typeof button.id === 'string' && button.id ? button.id : button.actionId

/** A toolbar button painted by a header/listing (not through renderComponent), tagged in the editor. */
export const stampButton = (button: { id?: unknown }, painted: TemplateResult): TemplateResult =>
    stamping && typeof button.id === 'string' && button.id ? html`${stampNodeId(button.id, painted)}` : painted
