import ClientSideComponent from "@/mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {
    renderClientSideComponent(component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        return renderClientSideComponent(component, baseUrl, state, data)
    }

}