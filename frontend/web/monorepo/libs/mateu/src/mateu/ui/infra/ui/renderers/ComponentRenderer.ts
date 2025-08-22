import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";

export interface ComponentRenderer {
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult
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