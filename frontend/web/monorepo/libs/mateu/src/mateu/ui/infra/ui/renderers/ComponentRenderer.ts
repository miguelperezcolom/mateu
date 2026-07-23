import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { MateuApp, MenuBarItem } from "@infra/ui/mateu-app.ts";
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";

export interface ComponentRenderer {
    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult
    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, searchOnly?: boolean): TemplateResult
    renderPagination(container: MateuTableCrud, component: ClientSideComponent | undefined): TemplateResult
    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult
    /** Short renderer name used in diagnostics and by the conformance suite (e.g. 'vaadin', 'sapui5'). */
    rendererName?(): string
    /**
     * The ComponentMetadataType set this renderer declares it supports. `undefined` means
     * "everything the shared switch supports" (the Vaadin reference renderer). For any other
     * renderer, a type outside this set reaching the shared fallback renders a visible
     * <mateu-unsupported> placeholder instead of silently falling back to Vaadin components
     * (see BasicComponentRenderer.renderClientSideComponent and unsupportedRenderer.ts).
     */
    supportedClientSideTypes?(): ReadonlySet<ComponentMetadataType> | undefined
    /**
     * When true, mateu-table-crud delegates ALL crud grid layouts (table, list, cards,
     * masterDetail, tree) to this renderer's renderTableComponent, instead of rendering the
     * non-table layouts itself with the shared Vaadin-flavoured templates. Lets a renderer
     * (e.g. sapui5) present every crud layout with its own design system. Default (absent /
     * false) keeps today's behavior, so the Vaadin reference renderer is unaffected.
     */
    rendersCrudLayouts?(): boolean
    /**
     * One header toolbar button (crud listing toolbar and page/form content header: New /
     * Delete / Save / Cancel / nav buttons), rendered with this renderer's design system
     * instead of the shared vaadin-button. `label` arrives already interpolated. Absent →
     * mateu-table-crud / mateu-content-header render their default vaadin-button (the Vaadin
     * reference renderer keeps working without implementing this).
     */
    renderToolbarButton?(button: unknown, label: string, onClick: () => void): TemplateResult

    /**
     * The previous/next peer-object arrows in the page header (the Redwood "next/previous object"
     * element). Absent → mateu-content-header renders its default vaadin-button arrows.
     */
    renderPeerNav?(peerNav: { prevLabel?: string, prevRoute?: string, nextLabel?: string, nextRoute?: string }): TemplateResult

    /**
     * The crud `tree` grid layout (a Selector Listing with gridLayout=tree — e.g. a tree lookup
     * dialog). Absent → mateu-table-crud renders its DS-neutral, always-expanded HTML tree table
     * with plain Select/View buttons. The Vaadin adapter overrides this with a real vaadin-grid +
     * vaadin-grid-tree-column (collapsible) and vaadin-button Select/View, matching the inline
     * mateu-vaadin-tree-select. The Select/View clicks dispatch the same `action-requested` events
     * (`action-on-row-select` / `view`) the shared tree emits, so the wire contract is unchanged.
     */
    renderTreeComponent?(container: MateuTableCrud, tree: {
        rows: unknown[]
        columns: { id: string, label?: string }[]
        idField: string | undefined
        navigable: boolean
        selectedId: string | undefined
    }): TemplateResult

    /**
     * A single icon by wire name (e.g. 'vaadin:plus', 'lumo:menu'). This is the "icon port": the core
     * renderers never emit a design-system icon element directly — they call the shared `icon()` helper
     * (renderers/neutralIcon.ts), which delegates here. The Vaadin adapter maps the name to a vaadin-icon element;
     * a DS renderer maps it to its own iconset (or its neutral placeholder). Absent → the neutral
     * fallback (a semantic <span data-icon> placeholder with no glyph).
     */
    renderIcon?(icon: string, style?: string, cssClasses?: string): TemplateResult

    /**
     * The app shell's top navigation (menu-on-top). Absent → the shell renders its DS-neutral
     * <details> strip (renderNeutralNav, no @vaadin). The Vaadin adapter overrides this with a
     * <vaadin-menu-bar> so the shell chrome uses Vaadin components like the rest of the renderer.
     * `onSelect` is the shell's existing menu-item handler (fires container.itemSelected).
     */
    renderTopNav?(items: MenuBarItem[], onSelect: (item: MenuBarItem) => void, cls?: string): TemplateResult
}

export class ComponentRendererSingleton {

    private afterRenderHook: ((element: HTMLElement) => void) | undefined = undefined
    private useShadowRoot = true
    private componentRenderer: ComponentRenderer | undefined = undefined

    public set(componentRenderer: ComponentRenderer) {
        this.componentRenderer = componentRenderer
        // Publish the renderer identity + declared supported types so external tooling (the
        // conformance suite, e2e/conformance.mjs) can query parity programmatically.
        if (typeof window !== 'undefined') {
            const supported = componentRenderer.supportedClientSideTypes?.();
            (window as unknown as Record<string, unknown>).__mateuRendererInfo = {
                name: componentRenderer.rendererName?.() ?? componentRenderer.constructor?.name ?? 'unknown',
                // null = declares support for the full shared switch (reference renderer)
                supportedTypes: supported ? [...supported].sort() : null,
            }
        }
    }

    public get(): ComponentRenderer | undefined {
        return this.componentRenderer
    }

    public setUseShadowRoot(useShadowRoot: boolean) {
        this.useShadowRoot = useShadowRoot
    }

    public mustUseShadowRoot() {
        return this.useShadowRoot
    }

    public setAfterRenderHook(afterRenderHook: ((element: HTMLElement) => void) | undefined) {
        this.afterRenderHook = afterRenderHook
    }

    public getAfterRenderHook(): ((element: HTMLElement) => void) | undefined {
        return this.afterRenderHook
    }

}

export const componentRenderer = new ComponentRendererSingleton();
