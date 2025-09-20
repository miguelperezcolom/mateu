import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { MateuComponent } from "@infra/ui/mateu-component.ts";
import { renderApp } from "@/renderers/renderApp.ts";

export class RedhatComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
        if (ComponentMetadataType.App == component?.metadata?.type) {
            return renderApp(container as MateuComponent, component, baseUrl, state, data)
        }return super.renderClientSideComponent(container, component, baseUrl, state, data, labelAlreadyRendered)
    }

}