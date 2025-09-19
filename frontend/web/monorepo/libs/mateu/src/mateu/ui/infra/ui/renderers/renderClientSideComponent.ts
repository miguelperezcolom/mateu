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
import { renderAvatar, renderAvatarGroup } from "@infra/ui/renderers/avatarRenderer";
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

export const updateStyle = (component: ClientSideComponent, data: any): string => {
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

export const updateMedata = (component: ClientSideComponent, data: any): ComponentMetadata | undefined => {
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

export const renderClientSideComponent = (container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, labelAlreadyRendered: boolean | undefined): TemplateResult => {
    if (component?.metadata) {

        const type = component.metadata.type

        component = { ...component, style: updateStyle(component, data), metadata: updateMedata(component, data)}

        if (type == ComponentMetadataType.Div) {
            return renderDiv(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Directory) {
            return renderDirectory(component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.FormLayout) {
            return renderFormLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.HorizontalLayout) {
            return renderHorizontalLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.VerticalLayout) {
            return renderVerticalLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.SplitLayout) {
            return renderSplitLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.MasterDetailLayout) {
            return renderMasterDetailLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.TabLayout) {
            return renderTabLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.AccordionLayout) {
            return renderAccordionLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.BoardLayout) {
            return renderBoardLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.BoardLayoutRow) {
            return renderBoardLayoutRow(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.BoardLayoutItem) {
            return renderBoardLayoutItem(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Scroller) {
            return renderScroller(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.FullWidth) {
            return renderFullWidth(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Container) {
            return renderContainer(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Form) {
            const metadata = component.metadata as Form
            return html`<mateu-form 
                id="${component.id}" 
            baseUrl="${baseUrl}"
                .component="${component}"
                .values="${state}"
                .state="${state}"
                .data="${data}"
                style="${component.style}" 
                class="${component.cssClasses}"
                slot="${component.slot??nothing}"
                >
                    ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
                ${metadata?.buttons?.map(button => html`
                   ${renderComponent(container, {
                    metadata: button,
                    type: ComponentType.ClientSide,
                       slot: 'buttons'
                } as unknown as ClientSideComponent, undefined, undefined, undefined)}
`)}

                </mateu-form>`
        }
        if (type == ComponentMetadataType.Table) {
            return html`<mateu-table
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${state}"
                            style="${component.style}" class="${component.cssClasses}"
                            slot="${component.slot??nothing}"
                >
                 ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
                </mateu-table>`
        }
        if (type == ComponentMetadataType.Crud) {
            return html`<mateu-table-crud
                            id="${component.id}"
                            baseUrl="${baseUrl}"
                            .component="${component}"
                            .metadata="${component.metadata}"
                            .state="${state}"
                            .data="${data}"
                            style="${component.style}" class="${component.cssClasses}"
                            slot="${component.slot??nothing}"
                >
                 ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
             </mateu-table-crud>`
        }

        if (type == ComponentMetadataType.App) {
            return html`
                <mateu-app
                            id="${component.id}"
                            baseUrl="${baseUrl}"
                            .component="${component}"
                            .data="${state}"
                            style="${component.style}" 
                          class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
             </mateu-app>`
        }

        if (type == ComponentMetadataType.Element) {
            return renderElement(component.metadata as Element, component.slot)
        }

        if (type == ComponentMetadataType.FormField) {
            const field = component.metadata as FormField
            return html`
        <mateu-field
                       id="${component.id}"
                .field="${component.metadata}"
                       .state="${state}"
                       .data="${data}"
                       style="${component.style}" class="${component.cssClasses}"
                       slot="${component.slot??nothing}"
                       data-colspan="${field.colspan}"
                       .labelAlreadyRendered="${labelAlreadyRendered}"
                >
                        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, labelAlreadyRendered))}
                    </mateu-field>
            `
        }
        if (type == ComponentMetadataType.Text) {
            return renderText(component, state, data)
        }
        if (type == ComponentMetadataType.Avatar) {
            return renderAvatar(component)
        }
        if (type == ComponentMetadataType.AvatarGroup) {
            return renderAvatarGroup(component)
        }
        if (type == ComponentMetadataType.Badge) {
            return renderBadge(component)
        }
        if (type == ComponentMetadataType.Breadcrumbs) {
            return renderBreadcrumbs(component)
        }
        if (type == ComponentMetadataType.Anchor) {
            return renderAnchor(component)
        }
        if (type == ComponentMetadataType.Button) {
            return renderButton(component)
        }
        // @ts-ignore
        if (type == ComponentMetadataType.Card) {
            return renderCard(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Chart) {
            return renderChart(component)
        }
        if (type == ComponentMetadataType.Icon) {
            return renderIcon(component)
        }
        if (type == ComponentMetadataType.ConfirmDialog) {
            return renderConfirmDialog(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.ContextMenu) {
            return renderContextMenu(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.CookieConsent) {
            return renderCookieConsent(component)
        }
        if (type == ComponentMetadataType.Details) {
            return renderDetails(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Dialog) {
            return renderDialog(component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Image) {
            return renderImage(component)
        }
        if (type == ComponentMetadataType.Map) {
            return renderMap(component)
        }
        if (type == ComponentMetadataType.Markdown) {
            return renderMarkdown(component)
        }
        if (type == ComponentMetadataType.MicroFrontend) {
            return renderMicroFrontend(component)
        }
        if (type == ComponentMetadataType.Notification) {
            return renderNotification(component)
        }
        if (type == ComponentMetadataType.ProgressBar) {
            return renderProgressBar(component)
        }
        if (type == ComponentMetadataType.Popover) {
            return renderPopover(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.CarouselLayout) {
            return renderCarouselLayout(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Tooltip) {
            return renderTooltip(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.MessageInput) {
            return renderMessageInput(component)
        }
        if (type == ComponentMetadataType.MessageList) {
            return renderMessageList(component)
        }
        if (type == ComponentMetadataType.CustomField) {
            return customFieldRenderer(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.MenuBar) {
            return renderMenuBar(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.Grid) {
            return renderGrid(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.VirtualList) {
            return renderVirtualList(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.FormSection) {
            return renderFormSection(container, component, baseUrl, state, data)
        }
        if (type == ComponentMetadataType.FormSubSection) {
            return renderFormSubSection(container, component, baseUrl, state, data)
        }
        //console.log('Unknown metadata type for component', type, component)
        return html`<p ${component?.slot??nothing}>Unknown metadata type ${type} for component ${component?.id}</p>`
    }
    else {
        return renderClientSideComponent(container, {
            id: nanoid(),
            metadata: component,
            type: ComponentType.ClientSide
        } as ClientSideComponent, baseUrl, state, data, labelAlreadyRendered)

    }
    console.log('No metadata for component', component)
    return html`<p ${component?.slot??nothing}>No metadata for component ${component?.id}</p>`
}
