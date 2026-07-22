import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts"
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts"
import { renderVirtualList } from "./renderers/renderVirtualList"


export class VaadinComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'vaadin'
    }

    // Vaadin-specific widget renderers moved OUT of the core switch into this adapter (the "move
    // Vaadin to the infrastructure adapter" refactor). The core keeps a design-system-neutral
    // fallback for each type; this override reinstates the Vaadin-optimized rendering.
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult {
        if (component?.metadata?.type === ComponentMetadataType.VirtualList) {
            return renderVirtualList(container, component, baseUrl, state, data, appState, appData)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

}
