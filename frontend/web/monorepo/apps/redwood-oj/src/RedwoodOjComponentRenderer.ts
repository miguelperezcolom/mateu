import { html, LitElement, nothing, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderForm } from "@/renderers/renderForm.ts";
import { renderPage } from "@/renderers/renderPage.ts";
import {
    renderFormLayout, renderFormRow, renderFormSection, renderFormSubSection,
    renderHorizontalLayout, renderVerticalLayout, renderSplitLayout, renderCard,
    renderText, renderBadge, renderAnchor, renderDialog, renderConfirmDialog,
    renderScroller, renderFullWidth, renderContainer,
    renderBoardLayout, renderBoardLayoutRow, renderBoardLayoutItem,
    renderMasterDetailLayout, renderCarouselLayout,
} from "@/renderers/renderLayouts.ts";
import {
    renderIcon, renderBreadcrumbs, renderNotification, renderProgressBar,
    renderDetails, renderAvatar, renderAvatarGroup, renderTooltip,
    renderPopover, renderMenuBar, renderContextMenu,
} from "@/renderers/renderDisplayComponents.ts";
import {
    renderGrid, renderTable, renderVirtualList, renderDirectory,
    renderCustomField, renderMessageList, renderMessageInput,
} from "@/renderers/renderData.ts";
import './components/mateu-redwood-tabs'
import './components/mateu-redwood-accordion'
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import './components/mateu-redwood-table'
import './components/mateu-redwood-pagination'
import './components/mateu-redwood-action-menu'

export const changed = (event: Event, fieldId: string) => {
    const element = event.target as HTMLInputElement
    event.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            fieldId
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
 * Types this renderer supports: everything handled by its own switch below (App is handled via
 * renderAppComponent, reached through the shared mateu-app infra), plus types it deliberately
 * delegates to the shared, design-system-agnostic infra (Element/Div/Image/MicroFrontend
 * markup; Crud → mateu-table-crud, which calls back into this renderer's table/filter-bar/
 * pagination; Chart/Bpmn render canvas/SVG; mateu-map renders an OpenLayers canvas;
 * mateu-markdown renders plain HTML typography; CookieConsent renders plain markup; and, since
 * parity phase 2, the Chat side panel and the Workflow/WorkflowElk/FormEditor SVG editors use
 * neutral plain-HTML chrome — no Vaadin components left in any of them).
 *
 * Anything else renders a visible <mateu-unsupported> placeholder instead of silently falling
 * back to Vaadin-flavoured components (parity phase 0). This set currently covers the full
 * shared switch (renderClientSideComponent.ts).
 */
const SUPPORTED_TYPES: ReadonlySet<ComponentMetadataType> = new Set([
    // own switch (+ App via renderAppComponent)
    ComponentMetadataType.App,
    ComponentMetadataType.Page,
    ComponentMetadataType.Form,
    ComponentMetadataType.Button,
    ComponentMetadataType.FormField,
    ComponentMetadataType.FormLayout,
    ComponentMetadataType.FormRow,
    ComponentMetadataType.FormSection,
    ComponentMetadataType.FormSubSection,
    ComponentMetadataType.HorizontalLayout,
    ComponentMetadataType.VerticalLayout,
    ComponentMetadataType.SplitLayout,
    ComponentMetadataType.MasterDetailLayout,
    ComponentMetadataType.Scroller,
    ComponentMetadataType.FullWidth,
    ComponentMetadataType.Container,
    ComponentMetadataType.BoardLayout,
    ComponentMetadataType.BoardLayoutRow,
    ComponentMetadataType.BoardLayoutItem,
    ComponentMetadataType.CarouselLayout,
    ComponentMetadataType.Card,
    ComponentMetadataType.Text,
    ComponentMetadataType.Badge,
    ComponentMetadataType.Anchor,
    ComponentMetadataType.Icon,
    ComponentMetadataType.Breadcrumbs,
    ComponentMetadataType.Notification,
    ComponentMetadataType.ProgressBar,
    ComponentMetadataType.Details,
    ComponentMetadataType.Avatar,
    ComponentMetadataType.AvatarGroup,
    ComponentMetadataType.Tooltip,
    ComponentMetadataType.Popover,
    ComponentMetadataType.MenuBar,
    ComponentMetadataType.ContextMenu,
    ComponentMetadataType.TabLayout,
    ComponentMetadataType.AccordionLayout,
    ComponentMetadataType.Dialog,
    ComponentMetadataType.ConfirmDialog,
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
    ComponentMetadataType.Image,
    ComponentMetadataType.MicroFrontend,
    ComponentMetadataType.Markdown,
    ComponentMetadataType.Chart,
    ComponentMetadataType.Bpmn,
    ComponentMetadataType.Map,
    ComponentMetadataType.Chat,
    ComponentMetadataType.CookieConsent,
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
])

export class RedwoodOjComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    rendererName(): string {
        return 'redwood-oj'
    }

    supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> {
        return SUPPORTED_TYPES
    }

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        const metadata = component?.metadata as Crud
        const doSearch = () => {
            const root = (container as any).renderRoot as (ShadowRoot | HTMLElement) ?? container
            const input = root.querySelector('oj-c-input-text') as any
            if (input) state['searchText'] = input.rawValue ?? input.value ?? state['searchText'] ?? ''
            container.search()
        }
        return html`
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; padding: 0.25rem 0;">
                ${metadata?.searchable ? html`
                    <oj-c-input-text
                        data-oj-binding-provider="preact"
                        label-hint="Search"
                        label-edge="none"
                        .value="${state.searchText ?? ''}"
                        @ojValueAction="${(e: CustomEvent) => { state['searchText'] = e.detail.value ?? '' }}"
                        style="min-width: 220px;"
                    ></oj-c-input-text>
                    <oj-c-button
                        data-oj-binding-provider="preact"
                        label="Search"
                        chroming="callToAction"
                        @ojAction="${doSearch}"
                    ></oj-c-button>
                ` : nothing}
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </div>
        `
    }

    // Rendered as a hand-styled plain <button> with the Redwood look (values measured from real
    // oj-c-buttons, themed through the --oj-* vars which DO inherit across shadow roots) instead
    // of an <oj-c-button>: this template also renders inside the shadow roots of the shared
    // mateu-content-header / mateu-page, where JET's document-level CSS-module stylesheets can't
    // reach, so a real oj-c-button mounts unstyled there.
    renderToolbarButton(button: unknown, label: string, onClick: () => void): TemplateResult {
        const btn = button as Button
        const kind =
            btn.color === 'error' || (btn as any).variant === 'error' || (btn as any).variant === 'danger' ? 'danger'
            : btn.buttonStyle === 'primary' ? 'callToAction'
            : 'outlined'
        const skin = kind === 'danger'
            ? 'background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;'
            : kind === 'callToAction'
            ? 'background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;'
            : 'background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);'
        return html`
            <button
                data-action-id="${btn.id}"
                style="${skin} border-radius: 4px; height: 40px; padding: 0 16px; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: 0.86rem; font-weight: 600; cursor: pointer; ${btn.disabled ? 'opacity: .4; pointer-events: none;' : ''}"
                ?disabled="${btn.disabled}"
                @click="${onClick}"
            >${label}</button>
        `
    }

    renderPagination(container: MateuTableCrud, _component: ClientSideComponent | undefined): TemplateResult {
        const id = container.id
        return html`
            <mateu-redwood-pagination
                data-oj-binding-provider="preact"
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
                totalElements="${(container.data[id]?.page?.totalElements) ?? 0}"
                pageSize="${(container.data[id]?.page?.pageSize) ?? 100}"
                pageNumber="${(container.data[id]?.page?.pageNumber) ?? 0}"
            ></mateu-redwood-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any, _appState: any, _appData: any): TemplateResult {
        return html`
        <mateu-redwood-table id="${container.id}"
                     .metadata="${component?.metadata}"
                     .data="${container.data}"
                     .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                     @sort-direction-changed="${container.directionChanged}"
                     @fetch-more-elements="${container.fetchMoreElements}"
                     .state="${state}"
                     baseUrl="${baseUrl}"
        ></mateu-redwood-table>
        `
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {
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
        if (ComponentMetadataType.HorizontalLayout == component?.metadata?.type) {
            return renderHorizontalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VerticalLayout == component?.metadata?.type) {
            return renderVerticalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.SplitLayout == component?.metadata?.type) {
            return renderSplitLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.MasterDetailLayout == component?.metadata?.type) {
            return renderMasterDetailLayout(container, component, baseUrl, state, data, appState, appData)
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
        if (ComponentMetadataType.CarouselLayout == component?.metadata?.type) {
            return renderCarouselLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Card == component?.metadata?.type) {
            return renderCard(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Text == component?.metadata?.type) {
            return renderText(container, component)
        }
        if (ComponentMetadataType.Badge == component?.metadata?.type) {
            return renderBadge(component)
        }
        if (ComponentMetadataType.Anchor == component?.metadata?.type) {
            return renderAnchor(component)
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
            return renderProgressBar(component, state)
        }
        if (ComponentMetadataType.Details == component?.metadata?.type) {
            return renderDetails(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Avatar == component?.metadata?.type) {
            return renderAvatar(component, state, data)
        }
        if (ComponentMetadataType.AvatarGroup == component?.metadata?.type) {
            return renderAvatarGroup(component)
        }
        if (ComponentMetadataType.Tooltip == component?.metadata?.type) {
            return renderTooltip(container, component, baseUrl, state, data, appState, appData)
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
        if (ComponentMetadataType.Grid == component?.metadata?.type) {
            return renderGrid(component, state)
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
        if (ComponentMetadataType.MessageList == component?.metadata?.type) {
            return renderMessageList(component)
        }
        if (ComponentMetadataType.MessageInput == component?.metadata?.type) {
            return renderMessageInput(component)
        }
        if (ComponentMetadataType.TabLayout == component?.metadata?.type) {
            return html`<mateu-redwood-tabs
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-redwood-tabs>`
        }
        if (ComponentMetadataType.AccordionLayout == component?.metadata?.type) {
            return html`<mateu-redwood-accordion
                    .component="${component}" .container="${container}" baseUrl="${baseUrl}"
                    .compState="${state}" .compData="${data}" .appState="${appState}" .appData="${appData}"
            ></mateu-redwood-accordion>`
        }
        if (ComponentMetadataType.Dialog == component?.metadata?.type) {
            return renderDialog(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.ConfirmDialog == component?.metadata?.type) {
            return renderConfirmDialog(container, component, baseUrl, state, data, appState, appData)
        }
        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        return renderApp(container, component!, baseUrl, state, data, appState, appData)
    }
}
