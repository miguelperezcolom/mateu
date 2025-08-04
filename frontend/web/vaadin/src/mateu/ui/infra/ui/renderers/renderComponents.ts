import { html, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import {
    renderAccordionLayout,
    renderBoardLayout, renderBoardLayoutItem,
    renderBoardLayoutRow,
    renderContainer, renderFormItem,
    renderFormLayout, renderFormRow,
    renderFullWidth,
    renderHorizontalLayout,
    renderMasterDetailLayout,
    renderScroller,
    renderSplitLayout,
    renderTabLayout,
    renderVerticalLayout
} from "@infra/ui/renderers/renderLayouts";
import { renderAvatar, renderAvatarGroup } from "@infra/ui/renderers/avatarRenderer";
import { renderVirtualList } from "@infra/ui/renderers/virtualRenderer";
import { renderGrid } from "@infra/ui/renderers/gridRenderer";
import { renderMessageList } from "@infra/ui/renderers/messageListRenderer";
import { renderContextMenu, renderMenuBar } from "@infra/ui/renderers/menuRenderer";
import { customFieldRenderer } from "@infra/ui/renderers/customFieldRenderer";
import { renderMessageInput } from "@infra/ui/renderers/messageInputRenderer";
import { renderTooltip } from "@infra/ui/renderers/tooltipRenderer";
import { renderComponent } from "@infra/ui/renderers/componentRenderer";
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
import { renderMicroFrontend } from "@infra/ui/renderers/microFrontendRenderer";
import { renderMarkdown } from "@infra/ui/renderers/markdownRenderer";
import { renderNotification } from "@infra/ui/renderers/notificationrenderer";
import { renderProgressBar } from "@infra/ui/renderers/progressBarRenderer";
import { renderPopover } from "@infra/ui/renderers/popoverRenderer";
import { renderMap } from "@infra/ui/renderers/mapRenderer";
import { renderImage } from "@infra/ui/renderers/imageRenderer";


export const renderClientSideComponent = (component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    if (component?.metadata) {

        if (component.metadata.type == ComponentMetadataType.FormLayout) {
            return renderFormLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.FormRow) {
            return renderFormRow(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.FormItem) {
            return renderFormItem(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.HorizontalLayout) {
            return renderHorizontalLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.VerticalLayout) {
            return renderVerticalLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.SplitLayout) {
            return renderSplitLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.MasterDetailLayout) {
            return renderMasterDetailLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.TabLayout) {
            return renderTabLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.AccordionLayout) {
            return renderAccordionLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.BoardLayout) {
            return renderBoardLayout(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.BoardLayoutRow) {
            return renderBoardLayoutRow(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.BoardLayoutItem) {
            return renderBoardLayoutItem(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Scroller) {
            return renderScroller(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.FullWidth) {
            return renderFullWidth(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Container) {
            return renderContainer(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Form) {
            return html`<mateu-form 
                id="${component.id}" 
            baseUrl="${baseUrl}"
                .component="${component}"
                .values="${state}"
                style="${component.style}" class="${component.cssClasses}"
                >
                    ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}        
                </mateu-form>`
        }
        if (component.metadata.type == ComponentMetadataType.Table) {
            return html`<mateu-table
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${state}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
                </mateu-table>`
        }
        if (component.metadata.type == ComponentMetadataType.TableCrud) {
            return html`<mateu-table-crud
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .component="${component}"
                .values="${state}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
             </mateu-table-crud>`
        }
        if (component.metadata.type == ComponentMetadataType.CardCrud) {
            return html`<mateu-table-crud
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${state}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
             </mateu-table-crud>`
        }

        if (component.metadata.type == ComponentMetadataType.Card) {
            return html`<mateu-card
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${state}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
             </mateu-card>`
        }

        if (component.metadata.type == ComponentMetadataType.App) {
            console.log('component', component)
            return html`<mateu-api-caller>
                <mateu-app
                            id="${component.id}"
                            baseUrl="${baseUrl}"
                            .component="${component}"
                            .data="${state}"
                            style="${component.style}" 
                            class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
             </mateu-app></mateu-api-caller>`
        }

        if (component.metadata.type == ComponentMetadataType.Element) {
            return renderElement(component.metadata as Element)
        }

        if (component.metadata.type == ComponentMetadataType.FormField) {
            return html`<mateu-field
                       id="${component.id}"
                .field="${component.metadata}"
                       .data="${state}"
                       style="${component.style}" class="${component.cssClasses}"
                >
                        ${component.children?.map(child => renderComponent(child, baseUrl, state, data))}
                    </mateu-field>`
        }
        if (component.metadata.type == ComponentMetadataType.Text) {
            return renderText(component, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Avatar) {
            return renderAvatar(component)
        }
        if (component.metadata.type == ComponentMetadataType.AvatarGroup) {
            return renderAvatarGroup(component)
        }
        if (component.metadata.type == ComponentMetadataType.Badge) {
            return renderBadge(component)
        }
        if (component.metadata.type == ComponentMetadataType.Anchor) {
            return renderAnchor(component)
        }
        if (component.metadata.type == ComponentMetadataType.Button) {
            return renderButton(component)
        }
        // @ts-ignore
        if (component.metadata.type == ComponentMetadataType.Card) {
            return renderCard(component)
        }
        if (component.metadata.type == ComponentMetadataType.Chart) {
            return renderChart(component)
        }
        if (component.metadata.type == ComponentMetadataType.Icon) {
            return renderIcon(component)
        }
        if (component.metadata.type == ComponentMetadataType.ConfirmDialog) {
            return renderConfirmDialog(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.ContextMenu) {
            return renderContextMenu(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.CookieConsent) {
            return renderCookieConsent(component)
        }
        if (component.metadata.type == ComponentMetadataType.Details) {
            return renderDetails(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Dialog) {
            return renderDialog(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Image) {
            return renderImage(component)
        }
        if (component.metadata.type == ComponentMetadataType.Map) {
            return renderMap(component)
        }
        if (component.metadata.type == ComponentMetadataType.Markdown) {
            return renderMarkdown(component)
        }
        if (component.metadata.type == ComponentMetadataType.MicroFrontend) {
            return renderMicroFrontend(component)
        }
        if (component.metadata.type == ComponentMetadataType.Notification) {
            return renderNotification(component)
        }
        if (component.metadata.type == ComponentMetadataType.ProgressBar) {
            return renderProgressBar(component)
        }
        if (component.metadata.type == ComponentMetadataType.Popover) {
            return renderPopover(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.Tooltip) {
            return renderTooltip(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.MessageInput) {
            return renderMessageInput(component)
        }
        if (component.metadata.type == ComponentMetadataType.MessageList) {
            return renderMessageList(component)
        }
        if (component.metadata.type == ComponentMetadataType.CustomField) {
            return customFieldRenderer(component, baseUrl, state, data)
        }
        if (component.metadata.type == ComponentMetadataType.MenuBar) {
            return renderMenuBar(component)
        }
        if (component.metadata.type == ComponentMetadataType.Grid) {
            return renderGrid(component, state)
        }
        if (component.metadata.type == ComponentMetadataType.VirtualList) {
            return renderVirtualList(component)
        }
        return html`<p>Unknown metadata type ${component.metadata.type} for component ${component?.id}</p>`
    }
    return html`<p>No metadata for component ${component?.id}</p>`
}
