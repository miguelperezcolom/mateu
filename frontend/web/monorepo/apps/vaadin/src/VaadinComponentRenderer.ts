import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts"
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts"
import { renderVirtualList } from "./renderers/renderVirtualList"
import { renderNotification } from "./renderers/renderNotification"

type WidgetRenderer = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
) => TemplateResult

/**
 * Vaadin-specific widget renderers that have been moved OUT of the core switch into this adapter
 * (the "move Vaadin rendering into the infrastructure adapter" refactor). The core keeps a
 * design-system-neutral fallback for each type; these overrides reinstate the Vaadin-optimized
 * rendering — exactly the mechanism SapUi5ComponentRenderer uses for its own widgets.
 *
 * Add a moved widget with a single line here.
 */
const VAADIN_WIDGETS: Partial<Record<ComponentMetadataType, WidgetRenderer>> = {
    [ComponentMetadataType.VirtualList]: (c, comp, b, s, d, as, ad) => renderVirtualList(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.Notification]: (_c, comp) => renderNotification(comp),
}

export class VaadinComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'vaadin'
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult {
        const type = component?.metadata?.type as ComponentMetadataType | undefined
        const widget = type ? VAADIN_WIDGETS[type] : undefined
        if (widget && component) {
            return widget(container, component, baseUrl, state, data, appState, appData)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

}
