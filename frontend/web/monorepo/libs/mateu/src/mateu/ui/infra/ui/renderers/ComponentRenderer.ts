import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export interface ComponentRenderer {
    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult
    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, searchOnly?: boolean): TemplateResult
    renderPagination(container: MateuTableCrud, component: ClientSideComponent | undefined): TemplateResult
    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult
}

export class ComponentRendererSingleton {

    private afterRenderHook: ((element: HTMLElement) => void) | undefined = undefined
    private useShadowRoot = true
    private componentRenderer: ComponentRenderer | undefined = undefined

    public set(componentRenderer: ComponentRenderer) {
        this.componentRenderer = componentRenderer
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
