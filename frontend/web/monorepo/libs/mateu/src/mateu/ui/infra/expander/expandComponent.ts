// Phase 6 (coherence-plan #1) — the client-side expander: turn an AUTHORED fluent component node
// (as parsed from a definition JSON/YAML) into the WIRE component the renderer paints, IN THE
// BROWSER, with no backend. This is the TS twin of the server's ComponentMapper for the 100%
// declarative path (a route with a `definition`, no `viewModel`).
//
// The mapping the server performs, distilled from a captured golden (about.yaml → its increment):
//   authored  { "type": "VerticalLayout", "content": [ { "type": "Text", "text": "hi" } ] }
//   wire       { "type": "ClientSide",
//                "metadata": { "type": "VerticalLayout" },
//                "children": [ { "type": "ClientSide",
//                                "metadata": { "type": "Text", "text": "hi" },
//                                "children": [] } ] }
//
// Two rules:
//  1. Every node becomes a ClientSide wrapper: `{ type: "ClientSide", metadata: { type, ...fields },
//     children }`. The authored type + its own fields live in `metadata`; the ENVELOPE fields (the
//     ones declared on the wire `Component` interface — id/style/cssClasses/slot/sizing/…) sit on
//     the ClientSide node itself, as siblings of `metadata`.
//  2. A CONTAINER type lifts its `content`/`children` into wire `children` (each recursively
//     expanded). A leaf carries no children.
//
// DEFAULTS ARE NOT FILLED. The server writes per-type defaults (VerticalLayout `spacing:false`, Text
// `container:"div"`/`noMargins:false`); the renderer already defaults missing metadata, so the
// expander emits the mechanical mapping and relies on RENDER-parity (see
// design/phase6-client-side-expander.md, "golden strategy"). Reproducing every component's defaults
// would be a fourth copy of what the three backends already hold.

import type Component from '@mateu/shared/apiClients/dtos/Component'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { resolveComponent } from '@infra/http/componentCatalogue'

/** An authored fluent node: a `type` discriminator plus arbitrary type-specific fields, with child
 *  content under `content` or `children`. This is what `js-yaml`/`JSON.parse` yields from a
 *  definition file — deliberately loose, since the authored surface is the whole component catalog. */
export interface FluentNode {
    type: string
    // Children of a layout container (an array), OR the single content of a Card-family node (one
    // node). `children` is the array alias some fluent shapes use.
    content?: FluentNode | FluentNode[]
    children?: FluentNode[]
    [field: string]: unknown
}

// The fields that live on the wire `Component` envelope (siblings of `metadata`), NOT inside
// `metadata`. Mirrors the `Component` interface. Everything else an authored node declares is
// type-specific and belongs in `metadata`.
const ENVELOPE_FIELDS = new Set([
    'id',
    'style',
    'cssClasses',
    'slot',
    'initialData',
    'confirmOnNavigationIfDirty',
    'sizing',
])

// Authored types whose `content`/`children` are LIFTED into wire `children`. These are the plain
// layout containers, where a child is a child. Types that hold their content specially (Card under
// `metadata.content`, FormLayout's packed rows, sections, listings) are NOT here — they get
// dedicated handling in later increments, each pinned to its own golden. An unknown type is treated
// as a leaf (its authored fields go to metadata, no child lifting), which is safe: it renders
// whatever the renderer makes of the metadata, and never silently drops a child into the void
// because a stray `content` on a non-container also lands in metadata verbatim.
const CONTAINER_TYPES = new Set([
    'VerticalLayout',
    'HorizontalLayout',
    'Div',
    'FlexLayout',
    // A custom component (coherence-plan #14) lifts its slotted `content` into wire children, exactly
    // like the server's CustomComponentMapper — its `name`/`props` stay in metadata. The rendering is
    // per-renderer (registerCustomComponent), but the expansion is the ordinary container mapping.
    'CustomComponent',
])

// Types that hold ONE child under `metadata.content` (expanded), NOT lifted to wire children — the
// Card family. Pinned by the Java golden (CardDefinitionSyncTest): a Card's content is a single
// expanded component in metadata.content, children stays empty, variants ride in metadata. Extend
// as later goldens add more (HeroSection, Notice-with-content, …), each verified against Java.
const CONTENT_IN_METADATA_TYPES = new Set([
    'Card',
])

// Authored listing types → the wire `Crud` component. Pinned by the Java golden
// (ReadListingDefinitionSyncTest): a read-only listing (no proxy/secret actions) renders as a DIRECT
// ClientSide Crud (the ServerSide SeededYamlPage wrapper only appears with server-side actions).
// `columns` are ClientSide-wrapped GridColumns; `toolbar`/`filters` serialize as their own wire types
// (a Button is `{type:"Button"}`, not ClientSide-wrapped), so they pass through as authored and the
// renderer defaults them. Everything else (title/rowRoute/rowsSource/…) rides in metadata as data.
// Scope: read + navigate (rowRoute); proxy/secret actions need a backend.
const LISTING_TYPES = new Set(['Listing', 'Crudl', 'Crud'])

/** Map one authored fluent node to its wire component. Recurses into a container's children, or —
 *  for a Card-family type — into its single `content`, placed under `metadata.content`; a listing
 *  becomes a Crud with its columns/toolbar/filters expanded. */
export function expandComponent(node: FluentNode): Component {
    if (LISTING_TYPES.has(node.type)) return expandListing(node)

    // A business-component reference (coherence-plan #13): resolve it against the shipped catalogue,
    // no backend. The catalogue entry is already a wire component, so it is returned as-is; an
    // unknown name is a graceful placeholder (matching the server's ComponentRef resolution).
    if (node.type === 'ComponentRef') {
        const resolved = resolveComponent(node.ref as string | undefined)
        if (resolved) return resolved
        return {
            type: ComponentType.ClientSide,
            metadata: { type: 'Text', text: `Unknown business component: ${node.ref as string}` },
            children: [],
        } as unknown as ClientSideComponent
    }

    const { type, content, children, ...fields } = node

    const envelope: Record<string, unknown> = {}
    const metadata: Record<string, unknown> = { type }
    for (const [key, value] of Object.entries(fields)) {
        if (ENVELOPE_FIELDS.has(key)) envelope[key] = value
        else metadata[key] = value
    }

    let kids: FluentNode[] = []
    if (CONTAINER_TYPES.has(type)) {
        // A plain layout container: content/children is an array of children, lifted to the wire.
        // Tolerate a single node authored without brackets.
        const c = content ?? children ?? []
        kids = Array.isArray(c) ? c : [c]
    } else if (
        CONTENT_IN_METADATA_TYPES.has(type)
        && content
        && typeof content === 'object'
        && !Array.isArray(content)
    ) {
        // A Card-family node: its single content child is expanded INTO metadata, not lifted.
        metadata.content = expandComponent(content as FluentNode)
    }

    // Cast through `unknown`: the wire `Component` interface marks style/cssClasses/slot/… as
    // required, but the server itself omits them when unset (exclude_none) and the renderer defaults
    // them. The expander emits the same minimal shape (render-parity), so this is deliberate.
    return {
        ...envelope,
        type: ComponentType.ClientSide,
        metadata,
        children: kids.map(expandComponent),
    } as unknown as ClientSideComponent
}

/**
 * Expand a listing definition (`type: Listing`/`Crudl`) into the wire `Crud` ClientSide component —
 * the shape the server produces for a read-only listing (ReadListingDefinitionSyncTest). The node
 * carries `id: "crud"` and `sizing: "fill"` (as the server does); `columns`/`toolbar`/`filters` hold
 * child components and are each expanded; `crudlType` defaults to `"table"`; everything else
 * (title/rowRoute/rowsSource/…) rides in metadata as data. A GridColumn keeps its `id` in metadata
 * (the column key the grid reads) as well as on the node, matching the golden.
 */
function expandListing(node: FluentNode): Component {
    const { type, content, children, ...fields } = node
    void type
    void content
    void children

    const envelope: Record<string, unknown> = { id: 'crud', sizing: 'fill' }
    const metadata: Record<string, unknown> = {
        type: 'Crud',
        crudlType: (fields.crudlType as string) ?? (fields.listingType as string) ?? 'table',
    }
    for (const [key, value] of Object.entries(fields)) {
        if (key === 'crudlType' || key === 'listingType') continue
        if (ENVELOPE_FIELDS.has(key)) envelope[key] = value
        else if (key === 'columns' && Array.isArray(value)) {
            metadata[key] = (value as FluentNode[]).map(expandColumn)
        } else metadata[key] = value // toolbar/filters/rowsSource/title/rowRoute pass through
    }

    return {
        ...envelope,
        type: ComponentType.ClientSide,
        metadata,
        children: [],
    } as unknown as ClientSideComponent
}

/** Expand a listing column into a ClientSide GridColumn. Its `id` is kept in metadata (the column
 *  key the grid reads) as well as on the node envelope, matching the server golden. */
function expandColumn(node: FluentNode): Component {
    const wire = expandComponent(node) as unknown as {
        id?: unknown
        metadata?: Record<string, unknown>
    }
    if (node.id !== undefined && wire.metadata) wire.metadata.id = node.id
    return wire as unknown as Component
}
