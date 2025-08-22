import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { LitElement, TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {
    // @ts-ignore
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        return renderClientSideComponent(container, component, baseUrl, state, data)
    }

}