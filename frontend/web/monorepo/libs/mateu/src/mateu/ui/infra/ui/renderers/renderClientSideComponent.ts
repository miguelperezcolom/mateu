import { html, LitElement, nothing, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import {
    renderAccordionLayout,
    renderBoardLayout,
    renderBoardLayoutItem,
    renderBoardLayoutRow,
    renderContainer,
    renderFormLayout,
    renderFullWidth,
    renderHorizontalLayout,
    renderMasterDetailLayout,
    renderScroller,
    renderSplitLayout,
    renderTabLayout,
    renderVerticalLayout
} from "@infra/ui/renderers/renderLayouts";
import {renderAvatar, renderAvatarGroup} from "@infra/ui/renderers/avatarRenderer";
import { renderVirtualList } from "@infra/ui/renderers/virtualRenderer";
import { renderGrid } from "@infra/ui/renderers/gridRenderer";
import { renderMessageList } from "@infra/ui/renderers/messageListRenderer";
import { renderContextMenu, renderMenuBar } from "@infra/ui/renderers/menuRenderer";
import { customFieldRenderer } from "@infra/ui/renderers/customFieldRenderer";
import { renderMessageInput } from "@infra/ui/renderers/messageInputRenderer";
import { renderTooltip } from "@infra/ui/renderers/tooltipRenderer";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { renderElement } from "@infra/ui/renderers/elementRenderer";
import { renderText } from "@infra/ui/renderers/textRenderer";
import { renderBadge } from "@infra/ui/renderers/badgeRenderer";
import { renderAnchor } from "@infra/ui/renderers/anchorRenderer";
import { renderButton } from "@infra/ui/renderers/buttonRenderer";
import { renderCard } from "@infra/ui/renderers/cardRenderer";
import { renderChart } from "@infra/ui/renderers/chartRenderer";
import { renderIcon } from "@infra/ui/renderers/iconRenderer";
import { renderConfirmDialog } from "@infra/ui/renderers/confirmDialogRenderer";
import { renderCookieConsent } from "@infra/ui/renderers/cookieConsentRenderer";
import { renderDetails } from "@infra/ui/renderers/detailsRenderer";
import { renderDialog } from "@infra/ui/renderers/dialogRenderer";
import { renderDrawer } from "@infra/ui/renderers/drawerRenderer";
import { renderMicroFrontend } from "@infra/ui/renderers/microFrontendRenderer";
import { renderMarkdown } from "@infra/ui/renderers/markdownRenderer";
import { renderNotification } from "@infra/ui/renderers/notificationrenderer";
import { renderProgressBar } from "@infra/ui/renderers/progressBarRenderer";
import { renderPopover } from "@infra/ui/renderers/popoverRenderer";
import { renderMap } from "@infra/ui/renderers/mapRenderer";
import { renderImage } from "@infra/ui/renderers/imageRenderer";
import { renderBreadcrumbs } from "@infra/ui/renderers/breadcrumbsRenderer";
import { renderCarouselLayout } from "@infra/ui/renderers/carouselRenderer";
import { renderDirectory } from "@infra/ui/renderers/directoryRenderer";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";
import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata.ts";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import { renderDiv } from "@infra/ui/renderers/divRenderer.ts";
import { nanoid } from "nanoid";
import { renderFormSection } from "@infra/ui/renderers/formSectionRenderer.ts";
import { renderFormSubSection } from "@infra/ui/renderers/formSubSectionRenderer.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { renderPage } from "@infra/ui/renderers/pageRenderer.ts";
import { renderCrud } from "@infra/ui/renderers/crudRenderer.ts";
import {renderBpmn} from "@infra/ui/renderers/bpmnRenderer.ts";
import {renderChat} from "@infra/ui/renderers/chatRenderer.ts";
import {renderWorkflow} from "@infra/ui/renderers/workflowRenderer.ts";
import {renderWorkflowElk} from "@infra/ui/renderers/workflowElkRenderer.ts";
import {renderFormEditor} from "@infra/ui/renderers/formEditorRenderer.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import {
    renderDashboardLayout,
    renderDashboardPanel,
    renderMetricCard,
    renderScoreboard
} from "@infra/ui/renderers/dashboardRenderer.ts";
import { renderFoldoutLayout } from "@infra/ui/renderers/foldoutRenderer.ts";
import { renderHeroSection } from "@infra/ui/renderers/heroRenderer.ts";
import { renderEmptyState, renderSkeleton } from "@infra/ui/renderers/emptyStateRenderer.ts";
import { renderGantt } from "@infra/ui/renderers/ganttRenderer.ts";
import { renderKanban } from "@infra/ui/renderers/kanbanRenderer.ts";
import { renderTimeline } from "@infra/ui/renderers/timelineRenderer.ts";
import { renderProgressSteps } from "@infra/ui/renderers/progressStepsRenderer.ts";
export const updateStyle = (component: ClientSideComponent, data: ComponentData): string => {
    let style = component.style
    if (component.id) {
        if (style && !style.endsWith(';')) {
            style += ';'
        }
        if (style == undefined) {
            style = ''
        }
        if (data[component.id + '.hidden'] == true) {
            style += 'display: none;'
        }
    }
    return style
}

export const updateMedata = (component: ClientSideComponent, data: ComponentData): ComponentMetadata | undefined => {
    let metadata = { ...component.metadata} as ComponentMetadata
    if (component.id && metadata) {
        if (metadata.type == ComponentMetadataType.Button) {
            const button = metadata as Button
            if (data[component.id + '.disabled'] == true) {
                button.disabled = true
            }
        }
        if (metadata.type == ComponentMetadataType.FormField) {
            const field = metadata as FormField
            if (data[component.id + '.disabled'] == true) {
                field.disabled = true
            }
        }
    }
    //console.log('metadata', component, data, metadata)
    return metadata
}

// Everything a per-type renderer might need. Each renderer in the dispatch table below picks the
// arguments it actually uses; the table replaces what used to be a ~60-branch if/else chain.
type RenderContext = {
    container: LitElement
    component: ClientSideComponent
    baseUrl: string | undefined
    state: ComponentState
    data: ComponentData
    appState: ComponentState
    appData: ComponentData
    labelAlreadyRendered: boolean | undefined
}

// A renderer that takes the full (container, component, baseUrl, state, data, appState, appData)
// signature — the common case. Adapts it to a RenderContext consumer so it can live in the table.
const full =
    (fn: (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined,
          state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => TemplateResult) =>
        (c: RenderContext) => fn(c.container, c.component, c.baseUrl, c.state, c.data, c.appState, c.appData)

// Maps a component metadata type to the function that renders it. Built once at module load.
const RENDERERS: Partial<Record<ComponentMetadataType, (c: RenderContext) => TemplateResult>> = {
    [ComponentMetadataType.Bpmn]: ({ component }) => renderBpmn(component),
    [ComponentMetadataType.Workflow]: ({ component }) => renderWorkflow(component),
    [ComponentMetadataType.WorkflowElk]: ({ component }) => renderWorkflowElk(component),
    [ComponentMetadataType.FormEditor]: ({ component }) => renderFormEditor(component),
    [ComponentMetadataType.Page]: full(renderPage),
    [ComponentMetadataType.Div]: full(renderDiv),
    [ComponentMetadataType.Directory]: ({ component, baseUrl, state, data }) => renderDirectory(component, baseUrl, state, data),
    [ComponentMetadataType.FormLayout]: full(renderFormLayout),
    [ComponentMetadataType.HorizontalLayout]: full(renderHorizontalLayout),
    [ComponentMetadataType.VerticalLayout]: full(renderVerticalLayout),
    [ComponentMetadataType.SplitLayout]: full(renderSplitLayout),
    [ComponentMetadataType.MasterDetailLayout]: full(renderMasterDetailLayout),
    [ComponentMetadataType.TabLayout]: full(renderTabLayout),
    [ComponentMetadataType.AccordionLayout]: full(renderAccordionLayout),
    [ComponentMetadataType.BoardLayout]: full(renderBoardLayout),
    [ComponentMetadataType.BoardLayoutRow]: full(renderBoardLayoutRow),
    [ComponentMetadataType.BoardLayoutItem]: full(renderBoardLayoutItem),
    [ComponentMetadataType.Scroller]: full(renderScroller),
    [ComponentMetadataType.FullWidth]: full(renderFullWidth),
    [ComponentMetadataType.Container]: full(renderContainer),
    [ComponentMetadataType.Form]: ({ container, component, baseUrl, state, data, appState, appData }) => {
        const metadata = component.metadata as Form
        return html`<mateu-form
            id="${component.id}"
        baseUrl="${baseUrl}"
            .component="${component}"
            .values="${state}"
            .state="${state}"
            .data="${data}"
            .appState="${appState}"
            .appdata="${appData}"
            style="${component.style}"
            class="${component.cssClasses}"
            slot="${component.slot??nothing}"
            >
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            ${metadata?.buttons?.map(button => html`
               ${renderComponent(container, {
            id: button.actionId,
            metadata: button,
            type: ComponentType.ClientSide,
               slot: 'buttons'
        } as unknown as ClientSideComponent, undefined, state, data, appState, appData)}
`)}

            </mateu-form>`
    },
    [ComponentMetadataType.Table]: ({ container, component, baseUrl, state, data, appState, appData }) => html`<mateu-table
                        id="${component.id}"
        baseUrl="${baseUrl}"
            .metadata="${component.metadata}"
            .state="${state}"
                        .data="${data}"
                        .appState="${appState}"
                        .appDate="${appData}"
                        style="${component.style}" class="${component.cssClasses}"
                        slot="${component.slot??nothing}"
            >
             ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            </mateu-table>`,
    [ComponentMetadataType.Crud]: full(renderCrud),
    [ComponentMetadataType.App]: ({ container, component, baseUrl, state, data, appState, appData }) => html`
            <mateu-app
                        id="${component.id}"
                        baseUrl="${baseUrl}"
                        .component="${component}"
                        .state="${state}"
                        .data="${data}"
                        style="${component.style}"
                        class="${component.cssClasses}"
                        .appState="${appState}"
                        .appData="${appData}"
            >
             ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
         </mateu-app>`,
    [ComponentMetadataType.Element]: ({ container, component }) => renderElement(container, component.metadata as Element, component),
    [ComponentMetadataType.FormField]: ({ container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered }) => {
        const field = component.metadata as FormField
        return html`
    <mateu-field
                   id="${component.id}"
                   .component="${component}"
            .field="${component.metadata}"
                   .state="${state}"
                   .data="${data}"
                   .appState="${appState}"
                   .appdata="${appData}"
                   style="${component.style}" class="${component.cssClasses}"
                   slot="${component.slot??nothing}"
                   data-colspan="${field.colspan}"
                   .labelAlreadyRendered="${labelAlreadyRendered}"
            >
                    ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData, labelAlreadyRendered))}
                </mateu-field>
        `
    },
    [ComponentMetadataType.Text]: ({ component, state, data, appState, appData }) => renderText(component, state, data, appState, appData),
    [ComponentMetadataType.Avatar]: ({ component, state, data }) => renderAvatar(component, state, data),
    [ComponentMetadataType.Chat]: ({ component, state, data }) => renderChat(component, state, data),
    [ComponentMetadataType.AvatarGroup]: ({ component }) => renderAvatarGroup(component),
    [ComponentMetadataType.Badge]: ({ component, state, data }) => renderBadge(component, state, data),
    [ComponentMetadataType.Breadcrumbs]: ({ component }) => renderBreadcrumbs(component),
    [ComponentMetadataType.Anchor]: ({ component }) => renderAnchor(component),
    [ComponentMetadataType.Button]: ({ component, state, data }) => renderButton(component, state, data),
    [ComponentMetadataType.Card]: full(renderCard),
    [ComponentMetadataType.Chart]: ({ component }) => renderChart(component),
    [ComponentMetadataType.Icon]: ({ component }) => renderIcon(component),
    [ComponentMetadataType.ConfirmDialog]: full(renderConfirmDialog),
    [ComponentMetadataType.ContextMenu]: full(renderContextMenu),
    [ComponentMetadataType.CookieConsent]: ({ component }) => renderCookieConsent(component),
    [ComponentMetadataType.Details]: full(renderDetails),
    [ComponentMetadataType.Dialog]: ({ component, baseUrl, state, data, appState, appData }) => renderDialog(component, baseUrl, state, data, appState, appData),
    [ComponentMetadataType.Drawer]: ({ component, baseUrl, state, data, appState, appData }) => renderDrawer(component, baseUrl, state, data, appState, appData),
    [ComponentMetadataType.Image]: ({ component }) => renderImage(component),
    [ComponentMetadataType.Map]: ({ component }) => renderMap(component),
    [ComponentMetadataType.Markdown]: ({ component }) => renderMarkdown(component),
    [ComponentMetadataType.MicroFrontend]: ({ component }) => renderMicroFrontend(component),
    [ComponentMetadataType.Notification]: ({ component }) => renderNotification(component),
    [ComponentMetadataType.ProgressBar]: ({ component, state }) => renderProgressBar(component, state),
    [ComponentMetadataType.Popover]: full(renderPopover),
    [ComponentMetadataType.CarouselLayout]: full(renderCarouselLayout),
    [ComponentMetadataType.Tooltip]: full(renderTooltip),
    [ComponentMetadataType.MessageInput]: ({ component }) => renderMessageInput(component),
    [ComponentMetadataType.MessageList]: ({ component }) => renderMessageList(component),
    [ComponentMetadataType.CustomField]: full(customFieldRenderer),
    [ComponentMetadataType.MenuBar]: ({ container, component, baseUrl, state, data }) => renderMenuBar(container, component, baseUrl, state, data),
    [ComponentMetadataType.Grid]: full(renderGrid),
    [ComponentMetadataType.VirtualList]: full(renderVirtualList),
    [ComponentMetadataType.FormSection]: full(renderFormSection),
    [ComponentMetadataType.FormSubSection]: full(renderFormSubSection),
    [ComponentMetadataType.MetricCard]: ({ component }) => renderMetricCard(component),
    [ComponentMetadataType.Scoreboard]: full(renderScoreboard),
    [ComponentMetadataType.DashboardPanel]: full(renderDashboardPanel),
    [ComponentMetadataType.DashboardLayout]: full(renderDashboardLayout),
    [ComponentMetadataType.FoldoutLayout]: full(renderFoldoutLayout),
    [ComponentMetadataType.HeroSection]: full(renderHeroSection),
    [ComponentMetadataType.EmptyState]: ({ component }) => renderEmptyState(component),
    [ComponentMetadataType.Skeleton]: ({ component }) => renderSkeleton(component),
    [ComponentMetadataType.Gantt]: ({ component }) => renderGantt(component),
    [ComponentMetadataType.Kanban]: ({ component }) => renderKanban(component),
    [ComponentMetadataType.Timeline]: ({ component }) => renderTimeline(component),
    [ComponentMetadataType.ProgressSteps]: ({ component }) => renderProgressSteps(component),
}

export const renderClientSideComponent = (container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult => {
    if (!component?.metadata) {
        // A raw metadata object arrived instead of a ClientSideComponent — wrap it and retry once.
        if (component == undefined) {
            console.warn('No metadata for component', component)
            return html`<p>No metadata for component</p>`
        }
        return renderClientSideComponent(container, {
            id: nanoid(),
            metadata: component,
            type: ComponentType.ClientSide
        } as unknown as ClientSideComponent, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    const type = component.metadata.type
    const resolved = { ...component, style: updateStyle(component, data), metadata: updateMedata(component, data) }

    const renderer = RENDERERS[type]
    if (renderer) {
        return renderer({ container, component: resolved, baseUrl, state, data, appState, appData, labelAlreadyRendered })
    }
    return html`<p ${resolved?.slot??nothing}>Unknown metadata type ${type} for component ${resolved?.id}</p>`
}
