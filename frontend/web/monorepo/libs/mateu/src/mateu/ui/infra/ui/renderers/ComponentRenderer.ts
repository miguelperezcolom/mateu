import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
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
