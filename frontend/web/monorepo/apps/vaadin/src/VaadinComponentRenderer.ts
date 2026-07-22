import { LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts"
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts"
import { renderVirtualList } from "./renderers/renderVirtualList"
import { renderNotification } from "./renderers/renderNotification"
import * as vLayouts from "./renderers/renderLayouts"
import { renderMenuBar, renderContextMenu } from "./renderers/renderMenu"
import { renderField } from "./fields/renderField"

type WidgetRenderer = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
    labelAlreadyRendered?: boolean,
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
    // Layout subsystem (moved from the core switch — pixel-perfect vaadin-* layout elements)
    [ComponentMetadataType.FormLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderFormLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.HorizontalLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderHorizontalLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.VerticalLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderVerticalLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.SplitLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderSplitLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.MasterDetailLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderMasterDetailLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.TabLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderTabLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.AccordionLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderAccordionLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.BoardLayout]: (c, comp, b, s, d, as, ad) => vLayouts.renderBoardLayout(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.BoardLayoutRow]: (c, comp, b, s, d, as, ad) => vLayouts.renderBoardLayoutRow(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.BoardLayoutItem]: (c, comp, b, s, d, as, ad) => vLayouts.renderBoardLayoutItem(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.Scroller]: (c, comp, b, s, d, as, ad) => vLayouts.renderScroller(c, comp, b, s, d, as, ad),
    // Menu subsystem
    [ComponentMetadataType.MenuBar]: (c, comp, b, s, d) => renderMenuBar(c, comp, b, s, d),
    [ComponentMetadataType.ContextMenu]: (c, comp, b, s, d, as, ad) => renderContextMenu(c, comp, b, s, d, as, ad),
    // Field subsystem
    [ComponentMetadataType.FormField]: (c, comp, b, s, d, as, ad, lar) => renderField(c, comp, b, s, d, as, ad, lar),
}

export class VaadinComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'vaadin'
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult {
        const type = component?.metadata?.type as ComponentMetadataType | undefined
        const widget = type ? VAADIN_WIDGETS[type] : undefined
        if (widget && component) {
            return widget(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

}
