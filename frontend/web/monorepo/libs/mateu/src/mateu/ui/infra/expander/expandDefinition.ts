// Phase 6 (coherence-plan #1) — expand an authored DEFINITION into a wire `UIIncrement`, in the
// browser, with no backend. This is increment 1: the BARE-LAYOUT case (a definition whose `layout`
// is a full component tree, no `viewModel`, no field synthesis / delta / listing yet — those arrive
// in later increments, each pinned to its own server golden).
//
// The envelope shape is taken from a captured server golden (about.yaml → its increment):
//   - one fragment, targetComponentId "ux_main", action "Replace", component = the expanded layout;
//   - a SetWindowTitle command carrying the page title (the route name when the definition declares
//     none);
//   - empty messages/banners, appendBanners false.
// Server-only fields the renderer does not require (wireVersion, appData/appState) are omitted — see
// the render-parity note in design/phase6-client-side-expander.md.

import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { expandComponent, type FluentNode } from '@infra/expander/expandComponent'

/** A parsed definition: either an envelope with a `layout:` (+ optional viewModel/actions/triggers),
 *  or a bare component tree (the whole object IS the layout). Loose by design — the authored surface
 *  is the full component catalog, parsed from JSON or YAML. */
export interface DefinitionSpec {
    layout?: FluentNode
    viewModel?: string
    modelView?: string
    actions?: unknown[]
    triggers?: unknown[]
    [field: string]: unknown
}

const MAIN = 'ux_main'

/** True when this definition can be expanded client-side: it has a layout and NO viewModel (a
 *  viewModel route runs server logic that cannot execute in the browser — the honest boundary). */
export function isClientExpandable(spec: DefinitionSpec): boolean {
    const hasViewModel = Boolean(spec.viewModel ?? spec.modelView)
    return !hasViewModel && Boolean(layoutOf(spec))
}

function layoutOf(spec: DefinitionSpec): FluentNode | undefined {
    if (spec.layout && typeof spec.layout === 'object') return spec.layout
    // Bare tree: the whole object is the layout, as long as it looks like a component node.
    if (typeof spec.type === 'string') return spec as unknown as FluentNode
    return undefined
}

/** Expand a bare-layout definition to a wire `UIIncrement`. `route` supplies the default window
 *  title when the definition declares none. Throws if the definition has no expandable layout. */
export function expandDefinition(spec: DefinitionSpec, route: string, title?: string): UIIncrement {
    const layout = layoutOf(spec)
    if (!layout) throw new Error(`Definition for route "${route}" has no layout to expand`)

    const windowTitle = title ?? route

    return {
        commands: [
            { targetComponentId: MAIN, type: 'SetWindowTitle', data: windowTitle } as never,
        ],
        messages: [],
        fragments: [
            {
                targetComponentId: MAIN,
                component: expandComponent(layout),
                data: undefined,
                state: undefined,
                action: UIFragmentAction.Replace,
                containerId: undefined,
            },
        ],
        banners: [],
        appendBanners: false,
        appData: undefined,
        appState: undefined,
    }
}
