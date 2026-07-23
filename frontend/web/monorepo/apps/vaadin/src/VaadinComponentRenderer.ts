import { LitElement, html, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts"
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts"
import { renderVirtualList } from "./renderers/renderVirtualList"
import { renderNotification } from "./renderers/renderNotification"
import { renderProgressBar } from "./renderers/renderProgressBar"
import { renderDetails } from "./renderers/renderDetails"
import { renderAvatar, renderAvatarGroup } from "./renderers/renderAvatar"
import { renderCard } from "./renderers/renderCard"
import * as vLayouts from "./renderers/renderLayouts"
import { renderMenuBar, renderContextMenu, renderTopNav as renderVaadinTopNav } from "./renderers/renderMenu"
import { MenuBarItem } from "@infra/ui/mateu-app"
import { renderField } from "./fields/renderField"
import { renderGrid } from "./grid/gridRenderer"
import { renderTableElement, renderCrudTable } from "./grid/renderTable"
import { MateuTableCrud } from "@infra/ui/mateu-table-crud"
import { renderPopover } from "./renderers/renderPopover"
import { renderVaadinToolbarButton, renderVaadinPeerNav } from "./renderers/renderToolbarButton"
import { renderVaadinIcon } from "./renderers/renderIcon"
import { renderButton as renderVaadinButton } from "./renderers/renderButton"
import { renderMessageInput as renderVaadinMessageInput, renderMessageList as renderVaadinMessageList } from "./renderers/renderMessages"
import { renderConfirmDialog as renderVaadinConfirmDialog } from "./renderers/renderConfirmDialog"
import { renderVaadinFoldout } from "./renderers/renderVaadinFoldout"
import "./grid/mateu-vaadin-tree"

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
    [ComponentMetadataType.ProgressBar]: (_c, comp, _b, s) => renderProgressBar(comp, s),
    [ComponentMetadataType.Details]: (c, comp, b, s, d, as, ad) => renderDetails(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.Avatar]: (_c, comp, _b, s, d) => renderAvatar(comp, s, d),
    [ComponentMetadataType.AvatarGroup]: (_c, comp) => renderAvatarGroup(comp),
    [ComponentMetadataType.Card]: (c, comp, b, s, d, as, ad) => renderCard(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.Button]: (_c, comp, _b, s, d) => renderVaadinButton(comp, s, d),
    [ComponentMetadataType.MessageInput]: (_c, comp) => renderVaadinMessageInput(comp),
    [ComponentMetadataType.MessageList]: (_c, comp) => renderVaadinMessageList(comp),
    [ComponentMetadataType.ConfirmDialog]: (c, comp, b, s, d, as, ad) => renderVaadinConfirmDialog(c, comp, b, s, d, as, ad),
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
    // Grid subsystem
    [ComponentMetadataType.Grid]: (c, comp, b, s, d, as, ad) => renderGrid(c, comp, b, s, d, as, ad),
    [ComponentMetadataType.Table]: (c, comp, b, s, d, as, ad) => renderTableElement(c, comp, b, s, d, as, ad),
    // Overlay widgets
    [ComponentMetadataType.Popover]: (c, comp, b, s, d, as, ad) => renderPopover(c, comp, b, s, d, as, ad),
    // Foldout → Vaadin carousel variant (always-expanded sections + sticky-first overview)
    [ComponentMetadataType.FoldoutLayout]: (c, comp, b, s, d, as, ad) => renderVaadinFoldout(c, comp, b, s, d, as, ad),
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

    // Crud listing table: the Vaadin adapter renders the vaadin-grid based <mateu-table> instead
    // of the core's neutral HTML table (BasicComponentRenderer.renderTableComponent).
    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult {
        return renderCrudTable(container, component, baseUrl, state, appState, appData)
    }

    // Crud tree layout (tree lookup selector): a real vaadin-grid tree instead of the core's neutral
    // always-expanded HTML tree table (matches the inline mateu-vaadin-tree-select).
    renderTreeComponent(_container: MateuTableCrud, tree: { rows: unknown[], columns: { id: string, label?: string }[], idField: string | undefined, navigable: boolean, selectedId: string | undefined }): TemplateResult {
        return html`
            <mateu-vaadin-tree
                    .rows="${tree.rows}"
                    .columns="${tree.columns}"
                    .idField="${tree.idField}"
                    .navigable="${tree.navigable}"
                    .selectedId="${tree.selectedId}"
            ></mateu-vaadin-tree>`
    }

    // Page/crud header buttons + peer-object arrows render as vaadin-button (the core header uses
    // native buttons by default).
    renderToolbarButton(button: unknown, label: string, onClick: () => void): TemplateResult {
        return renderVaadinToolbarButton(button, label, onClick)
    }

    renderPeerNav(peerNav: { prevLabel?: string, prevRoute?: string, nextLabel?: string, nextRoute?: string }): TemplateResult {
        return renderVaadinPeerNav(peerNav)
    }

    // Icon port → vaadin-icon (the core `icon()` helper delegates here; core stays @vaadin-free).
    renderIcon(icon: string, style?: string, cssClasses?: string): TemplateResult {
        return renderVaadinIcon(icon, style, cssClasses)
    }

    // App shell top navigation → vaadin-menu-bar (the core shell renders a neutral <details> strip).
    renderTopNav(items: MenuBarItem[], onSelect: (item: MenuBarItem) => void, cls?: string): TemplateResult {
        return renderVaadinTopNav(items, onSelect, cls)
    }

}
