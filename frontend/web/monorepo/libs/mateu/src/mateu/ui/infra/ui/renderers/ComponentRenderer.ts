import { TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";

export interface ComponentRenderer {
    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult
}

export class ComponentRendererSingleton {

    private componentRenderer: ComponentRenderer | undefined = undefined

    public set(componentRenderer: ComponentRenderer) {
        this.componentRenderer = componentRenderer
    }

    public get(): ComponentRenderer | undefined {
        return this.componentRenderer
    }
}

export const componentRenderer = new ComponentRendererSingleton();