import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { LitElement, TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderApp } from "@infra/ui/renderers/appRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {
    // @ts-ignore
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        return renderClientSideComponent(container, component, baseUrl, state, data)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult {
        return renderApp(container, component?.metadata as App)
    }

}