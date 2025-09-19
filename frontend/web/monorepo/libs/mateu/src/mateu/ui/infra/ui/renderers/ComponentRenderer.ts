import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";

export interface ComponentRenderer {
    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult
    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, labelAlreadyRendered: boolean | undefined): TemplateResult
}

export class ComponentRendererSingleton {

    private afterRenderHook: any
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

    public setAfterRenderHook(afterRenderHook: any) {
        this.afterRenderHook = afterRenderHook
    }

    public getAfterRenderHook() {
        return this.afterRenderHook
    }

}

export const componentRenderer = new ComponentRendererSingleton();