import { html, LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import './components/mateu-sapui5-table'
import './components/mateu-sapui5-filter-bar'
import './components/mateu-sapui5-pagination'
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { renderPage } from "@/renderers/renderPage.ts";
import { renderForm } from "@/renderers/renderForm.ts";
import { renderFormSection, renderFormSubSection, renderCard, renderAnchor, renderDialog, renderConfirmDialog } from "@/renderers/renderSections.ts";
import { renderAvatar, renderAvatarGroup, renderTooltip, renderCarouselLayout, renderPopover, renderMenuBar } from "@/renderers/renderMore.ts";
import {
    renderHorizontalLayout,
    renderVerticalLayout,
    renderFormLayout,
    renderFormRow,
    renderTabLayout,
    renderAccordionLayout,
    renderSplitLayout,
    renderScroller,
    renderFullWidth,
    renderContainer,
    renderBoardLayout,
    renderBoardLayoutRow,
    renderBoardLayoutItem
} from "@/renderers/renderLayouts.ts";
import {
    renderText,
    renderBadge,
    renderIcon,
    renderBreadcrumbs,
    renderNotification,
    renderProgressBar,
    renderDetails,
    renderImage
} from "@/renderers/renderDisplayComponents.ts";
import {
    renderMarkdown,
    renderGrid,
    renderTable,
    renderVirtualList,
    renderContextMenu,
    renderDirectory,
    renderCustomField,
    renderMasterDetailLayout,
    renderMessageList,
    renderMessageInput
} from "@/renderers/renderAdvanced.ts";
import { MateuComponent } from "@infra/ui/mateu-component.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

export const changed = (event: Event) => {
    const element = event.target as HTMLInputElement
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            fieldId: element.id
        },
        bubbles: true,
        composed: true
    }))
}

export const checkboxChanged = (event: Event) => {
    const element = event.target as HTMLInputElement
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.checked,
            fieldId: element.id
        },
        bubbles: true,
        composed: true
    }))
}

export const handleButtonClick = (event: Event) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
        },
        bubbles: true,
        composed: true
    }))
}

/**
 * Types this renderer supports: everything handled by its own switch below, plus types it
 * deliberately delegates to the shared, design-system-agnostic infra (Element/Div/
 * MicroFrontend markup; Crud → mateu-table-crud, which calls back into this renderer's
 * table/filter-bar/pagination and — via rendersCrudLayouts() — also its list/cards/
 * masterDetail/tree layouts; Chart/Bpmn render canvas/SVG; mateu-map renders an OpenLayers
 * canvas; mateu-markdown renders plain HTML typography; CookieConsent renders plain markup;
 * and, since parity phase 2, the Chat side panel and the Workflow/WorkflowElk/FormEditor SVG
 * editors use neutral plain-HTML chrome — no Vaadin components left in any of them).
 *
 * Anything else renders a visible <mateu-unsupported> placeholder instead of silently falling
 * back to Vaadin-flavoured components (parity phase 0). This set currently covers the full
 * shared switch (renderClientSideComponent.ts).
 */
const SUPPORTED_TYPES: ReadonlySet<ComponentMetadataType> = new Set([
    // own switch
    ComponentMetadataType.App,
    ComponentMetadataType.Page,
    ComponentMetadataType.Form,
    ComponentMetadataType.Button,
    ComponentMetadataType.FormField,
    ComponentMetadataType.HorizontalLayout,
    ComponentMetadataType.VerticalLayout,
    ComponentMetadataType.FormLayout,
    ComponentMetadataType.FormRow,
    ComponentMetadataType.FormSection,
    ComponentMetadataType.FormSubSection,
    ComponentMetadataType.Card,
    ComponentMetadataType.TabLayout,
    ComponentMetadataType.AccordionLayout,
    ComponentMetadataType.SplitLayout,
    ComponentMetadataType.MasterDetailLayout,
    ComponentMetadataType.Scroller,
    ComponentMetadataType.FullWidth,
    ComponentMetadataType.Container,
    ComponentMetadataType.BoardLayout,
    ComponentMetadataType.BoardLayoutRow,
    ComponentMetadataType.BoardLayoutItem,
    ComponentMetadataType.Text,
    ComponentMetadataType.Badge,
    ComponentMetadataType.Icon,
    ComponentMetadataType.Breadcrumbs,
    ComponentMetadataType.Notification,
    ComponentMetadataType.ProgressBar,
    ComponentMetadataType.Details,
    ComponentMetadataType.Image,
    ComponentMetadataType.Anchor,
    ComponentMetadataType.Dialog,
    ComponentMetadataType.Drawer,
    ComponentMetadataType.ConfirmDialog,
    ComponentMetadataType.Avatar,
    ComponentMetadataType.AvatarGroup,
    ComponentMetadataType.Tooltip,
    ComponentMetadataType.CarouselLayout,
    ComponentMetadataType.Popover,
    ComponentMetadataType.MenuBar,
    ComponentMetadataType.ContextMenu,
    ComponentMetadataType.Markdown,
    ComponentMetadataType.Grid,
    ComponentMetadataType.Table,
    ComponentMetadataType.VirtualList,
    ComponentMetadataType.Directory,
    ComponentMetadataType.CustomField,
    ComponentMetadataType.MessageList,
    ComponentMetadataType.MessageInput,
    // deliberate delegation to shared, design-system-agnostic infra
    ComponentMetadataType.Crud,
    ComponentMetadataType.Element,
    ComponentMetadataType.Div,
    ComponentMetadataType.MicroFrontend,
    ComponentMetadataType.Chart,
    ComponentMetadataType.Bpmn,
    ComponentMetadataType.CookieConsent,
    ComponentMetadataType.Map,
    ComponentMetadataType.Chat,
    ComponentMetadataType.Workflow,
    ComponentMetadataType.WorkflowElk,
    ComponentMetadataType.FormEditor,
    ComponentMetadataType.MetricCard,
    ComponentMetadataType.Scoreboard,
    ComponentMetadataType.DashboardPanel,
    ComponentMetadataType.DashboardLayout,
    ComponentMetadataType.FoldoutLayout,
    ComponentMetadataType.HeroSection,
    ComponentMetadataType.EmptyState,
    ComponentMetadataType.Skeleton,
    ComponentMetadataType.Gantt,
    ComponentMetadataType.Kanban,
    ComponentMetadataType.Timeline,
    ComponentMetadataType.ProgressSteps,
])

export class SapUi5ComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'sapui5'
    }

    supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> {
        return SUPPORTED_TYPES
    }

    // mateu-table-crud delegates ALL crud grid layouts (table/list/cards/masterDetail/tree) to
    // renderTableComponent, so mateu-sapui5-table renders them with SAP UI5 components instead
    // of the shared Vaadin-flavoured templates.
    rendersCrudLayouts(): boolean {
        return true
    }

    // Crud header toolbar buttons render as real ui5-buttons (the shared default is a
    // vaadin-button). buttonStyle primary → Emphasized, error/danger color → Negative.
    renderToolbarButton(button: unknown, label: string, onClick: () => void): TemplateResult {
        const btn = button as { id?: string, buttonStyle?: string, color?: string, variant?: string, disabled?: boolean }
        const design =
            btn.color === 'error' || btn.variant === 'error' || btn.variant === 'danger' ? 'Negative'
            : btn.buttonStyle === 'primary' ? 'Emphasized'
            : 'Default'
        return html`
            <ui5-button data-action-id="${btn.id}" design="${design}" ?disabled="${btn.disabled}"
                        @click="${onClick}">${label}</ui5-button>`
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult {

        if (ComponentMetadataType.App == component?.metadata?.type) {
            return renderApp(container as MateuComponent, component, baseUrl, state, data)
        }
        if (ComponentMetadataType.Page == component?.metadata?.type) {
            return renderPage(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Form == component?.metadata?.type) {
            return renderForm(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            return renderButton(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            return renderField(container, component, baseUrl, state, data)
        }

        // Layouts
        if (ComponentMetadataType.HorizontalLayout == component?.metadata?.type) {
            return renderHorizontalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VerticalLayout == component?.metadata?.type) {
            return renderVerticalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormLayout == component?.metadata?.type) {
            return renderFormLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormRow == component?.metadata?.type) {
            return renderFormRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormSection == component?.metadata?.type) {
            return renderFormSection(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormSubSection == component?.metadata?.type) {
            return renderFormSubSection(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Card == component?.metadata?.type) {
            return renderCard(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.TabLayout == component?.metadata?.type) {
            return renderTabLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.AccordionLayout == component?.metadata?.type) {
            return renderAccordionLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.SplitLayout == component?.metadata?.type) {
            return renderSplitLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Scroller == component?.metadata?.type) {
            return renderScroller(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FullWidth == component?.metadata?.type) {
            return renderFullWidth(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Container == component?.metadata?.type) {
            return renderContainer(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayout == component?.metadata?.type) {
            return renderBoardLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayoutRow == component?.metadata?.type) {
            return renderBoardLayoutRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayoutItem == component?.metadata?.type) {
            return renderBoardLayoutItem(container, component, baseUrl, state, data, appState, appData)
        }

        // Display components
        if (ComponentMetadataType.Text == component?.metadata?.type) {
            return renderText(component, state, data, appState, appData)
        }
        if (ComponentMetadataType.Badge == component?.metadata?.type) {
            return renderBadge(component, state, data)
        }
        if (ComponentMetadataType.Icon == component?.metadata?.type) {
            return renderIcon(component)
        }
        if (ComponentMetadataType.Breadcrumbs == component?.metadata?.type) {
            return renderBreadcrumbs(component)
        }
        if (ComponentMetadataType.Notification == component?.metadata?.type) {
            return renderNotification(component)
        }
        if (ComponentMetadataType.ProgressBar == component?.metadata?.type) {
            return renderProgressBar(component)
        }
        if (ComponentMetadataType.Details == component?.metadata?.type) {
            return renderDetails(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Image == component?.metadata?.type) {
            return renderImage(component)
        }
        if (ComponentMetadataType.Anchor == component?.metadata?.type) {
            return renderAnchor(component)
        }
        if (ComponentMetadataType.Dialog == component?.metadata?.type) {
            return renderDialog(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.ConfirmDialog == component?.metadata?.type) {
            return renderConfirmDialog(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Avatar == component?.metadata?.type) {
            return renderAvatar(component)
        }
        if (ComponentMetadataType.AvatarGroup == component?.metadata?.type) {
            return renderAvatarGroup(component)
        }
        if (ComponentMetadataType.Tooltip == component?.metadata?.type) {
            return renderTooltip(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.CarouselLayout == component?.metadata?.type) {
            return renderCarouselLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Popover == component?.metadata?.type) {
            return renderPopover(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MenuBar == component?.metadata?.type) {
            return renderMenuBar(container, component)
        }
        if (ComponentMetadataType.ContextMenu == component?.metadata?.type) {
            return renderContextMenu(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Markdown == component?.metadata?.type) {
            return renderMarkdown(component)
        }
        if (ComponentMetadataType.Grid == component?.metadata?.type) {
            return renderGrid(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Table == component?.metadata?.type) {
            return renderTable(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VirtualList == component?.metadata?.type) {
            return renderVirtualList(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Directory == component?.metadata?.type) {
            return renderDirectory(component)
        }
        if (ComponentMetadataType.CustomField == component?.metadata?.type) {
            return renderCustomField(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MasterDetailLayout == component?.metadata?.type) {
            return renderMasterDetailLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MessageList == component?.metadata?.type) {
            return renderMessageList(component)
        }
        if (ComponentMetadataType.MessageInput == component?.metadata?.type) {
            return renderMessageInput(component)
        }

        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        const metadata = component?.metadata as Crud
        const onValueChanged = (e: CustomEvent) => {
            const { fieldId, value } = e.detail
            container.state = { ...container.state, [fieldId]: value }
        }
        const onFilterResetRequested = (e: CustomEvent) => {
            const { fieldIds } = e.detail as { fieldIds: string[] }
            const reset: Record<string, any> = {}
            fieldIds?.forEach((id: string) => { reset[id] = undefined })
            reset['searchText'] = undefined
            container.state = { ...container.state, ...reset }
        }
        return html`
            <mateu-sapui5-filter-bar
                .metadata="${metadata}"
                .state="${container.state}"
                .data="${data}"
                .appState="${appState}"
                .appData="${appData}"
                baseUrl="${baseUrl ?? ''}"
                @search-requested="${container.search}"
                @value-changed="${onValueChanged}"
                @filter-reset-requested="${onFilterResetRequested}"
                @action-requested="${(e: CustomEvent) => {
                    e.stopPropagation()
                    container.dispatchEvent(new CustomEvent('action-requested', {
                        detail: e.detail, bubbles: true, composed: true
                    }))
                }}"
            >
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </mateu-sapui5-filter-bar>
        `
    }

    renderPagination(container: MateuTableCrud, _component: ClientSideComponent | undefined): TemplateResult {
        const id = container.id
        return html`
            <mateu-sapui5-pagination
                totalElements="${container.data[id]?.page?.totalElements ?? 0}"
                pageSize="${container.data[id]?.page?.pageSize ?? 100}"
                pageNumber="${container.data[id]?.page?.pageNumber ?? 0}"
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
            ></mateu-sapui5-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any, appState: any, appData: any): TemplateResult {
        return html`
            <mateu-sapui5-table
                id="${container.id}"
                .metadata="${component?.metadata}"
                .data="${container.data}"
                .state="${state}"
                .appState="${appState}"
                .appData="${appData}"
                .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                baseUrl="${baseUrl}"
                @sort-changed="${(e: CustomEvent) => {
                    container.state.sort = e.detail.sorts
                    container.handleSearchRequested(undefined)
                }}"
                @fetch-more-elements="${container.fetchMoreElements}"
                @action-requested="${(e: CustomEvent) => {
                    e.stopPropagation()
                    container.dispatchEvent(new CustomEvent('action-requested', {
                        detail: e.detail,
                        bubbles: true,
                        composed: true
                    }))
                }}"
            ></mateu-sapui5-table>
        `
    }

}
