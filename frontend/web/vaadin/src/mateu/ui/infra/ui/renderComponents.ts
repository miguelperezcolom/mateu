import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, TemplateResult } from "lit";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";
import Avatar from "@mateu/shared/apiClients/dtos/componentmetadata/Avatar";
import AvatarGroup from "@mateu/shared/apiClients/dtos/componentmetadata/AvatarGroup";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button";
import Anchor from "@mateu/shared/apiClients/dtos/componentmetadata/Anchor";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";
import Chart from "@mateu/shared/apiClients/dtos/componentmetadata/Chart";
import Icon from "@mateu/shared/apiClients/dtos/componentmetadata/Icon";
import ConfirmDialog from "@mateu/shared/apiClients/dtos/componentmetadata/ConfirmDialog";
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import CookieConsent from "@mateu/shared/apiClients/dtos/componentmetadata/CookieConsent";
import Details from "@mateu/shared/apiClients/dtos/componentmetadata/Details";
import { dialogHeaderRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import Image from "@mateu/shared/apiClients/dtos/componentmetadata/Image";
import Map from "@mateu/shared/apiClients/dtos/componentmetadata/Map";
import Markdown from "@mateu/shared/apiClients/dtos/componentmetadata/Markdown";
import MicroFrontend from "@mateu/shared/apiClients/dtos/componentmetadata/MicroFrontend";
import Notification from "@mateu/shared/apiClients/dtos/componentmetadata/Notification";
import { nanoid } from "nanoid";
import { notificationRenderer } from "@vaadin/notification/lit";
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar";
import Popover from "@mateu/shared/apiClients/dtos/componentmetadata/Popover";
import { popoverRenderer } from "@vaadin/popover/lit";
import Tooltip from "@mateu/shared/apiClients/dtos/componentmetadata/Tooltip";
import MessageInput from "@mateu/shared/apiClients/dtos/componentmetadata/MessageInput";
import Dialog from "@mateu/shared/apiClients/dtos/componentmetadata/Dialog";
import CustomField from "@mateu/shared/apiClients/dtos/componentmetadata/CustomField";
import MenuBar from "@mateu/shared/apiClients/dtos/componentmetadata/MenuBar";
import MessageList from "@mateu/shared/apiClients/dtos/componentmetadata/MessageList";
import Grid from "@mateu/shared/apiClients/dtos/componentmetadata/Grid";
import { GridDataProviderCallback, GridDataProviderParams } from "@vaadin/grid";
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList";
import { virtualListRenderer } from "@vaadin/virtual-list/lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import {
    renderAccordionLayout,
    renderBoardLayout,
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
} from "@infra/ui/renderLayouts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType";

export const renderVirtualList = (component: ClientSideComponent) => {
    const metadata = component.metadata as VirtualList

    const renderer = (item: any) => html`
            ${JSON.stringify(item)}
`

    return html`
        <vaadin-virtual-list
                .items="${metadata.page.items}"
                ${virtualListRenderer(renderer, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-virtual-list>
    `
}

export const renderGrid = (component: ClientSideComponent, data: any) => {
    const metadata = component.metadata as Grid
    if (metadata.tree) {
        const dataProvider = async (
            params: GridDataProviderParams<any>,
            callback: GridDataProviderCallback<any>
    ) => {
            // The requested page and the full length of the corresponding
            // hierarchy level is requested from the data service
            /*
            const { people, hierarchyLevelSize } = await getPeople({
                count: params.pageSize,
                startIndex: params.page * params.pageSize,
                managerId: params.parentItem ? params.parentItem.id : null,
            });
             */
            const items = params.parentItem?params.parentItem.children:metadata.page.items

            callback(items, items.length);
        }

        return html`
        <vaadin-grid style="${component.style}" class="${component.cssClasses}"
                     .itemHasChildrenPath="${'children'}" .dataProvider="${dataProvider}"
        >
            ${metadata.columns.map((column, index) => index > 0?html`
            <vaadin-grid-column path="${column.id}">${index} - ${column.label}</vaadin-grid-column>
`:html`
            <vaadin-grid-tree-column path="${column.id}">${index} - ${column.label}</vaadin-grid-tree-column>
`)}
        </vaadin-grid>
    `
    }
    let items = metadata.page?.items
    if (metadata.bindToData && component.id && data) {
        items = data[component.id]
    }
    return html`
        <vaadin-grid style="${component.style}" class="${component.cssClasses}" .items="${items}">
            ${metadata.columns.map(column => html`
            <vaadin-grid-column path="${column.id}">${column.label}</vaadin-grid-column>
`)}
        </vaadin-grid>
    `

}

export const renderMessageList = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as MessageList
    return html`
        <vaadin-message-list
                style="${component.style}" class="${component.cssClasses}"
                .items="${[
    {
    text: '**Hello team!** Did everyone review the *design document* for the new project?',
    userName: 'Alex Johnson',
    },
    {
    text: `## Project Update
I've completed the initial research phase and documented my findings.

* UI mockups ✅
* Market analysis ✅
* [See detailed report](https://vaadin.com)

Let me know your thoughts!`,
    userName: 'Sam Rivera',
    },
    ]
                }"
        ></vaadin-message-list>
    `
}

export const renderMenuBar = (component: ClientSideComponent) => {
    const metadata = component.metadata as MenuBar

    return html`
        <vaadin-menu-bar .items=${mapItems(metadata.options)}
                         style="${component.style}" class="${component.cssClasses}">
        </vaadin-menu-bar>
            `
}

export const renderCustomField = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as CustomField

    return html`
        <vaadin-custom-field label="${metadata.label}"
                             style="${component.style}" class="${component.cssClasses}">
            ${renderComponent(metadata.content, baseUrl, data)}
        </vaadin-custom-field>
            `
}

export const renderMessageInput = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as MessageInput
    return html`
        <vaadin-message-input style="${component.style}" class="${component.cssClasses}"></vaadin-message-input>
    `
}

export const renderTooltip = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Tooltip
    return html`
        <div id="show-notifications">${renderComponent(metadata.wrapped, baseUrl, data)}</div>
        <vaadin-tooltip
                style="${component.style}" class="${component.cssClasses}"
                for="show-notifications" text="${metadata.text}" position="top-start"></vaadin-tooltip>
    `
}

export const renderPopover = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Popover
    html`${renderComponent(metadata.content, baseUrl, data)}`

    return html`
        <div id="show-notifications">${renderComponent(metadata.wrapped, baseUrl, data)}</div>
        <vaadin-popover
                for="show-notifications"
                theme="arrow no-padding"
                modal
                accessible-name-ref="notifications-heading"
                content-width="300px"
                position="bottom"
                ${popoverRenderer(popover => {
                    console.log('popover', popover)
                    return html`${renderComponent(metadata.content, baseUrl, data)}`
                }, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-popover>
    `
}

export const renderProgressBar = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as ProgressBar

    return html`
        <vaadin-progress-bar indeterminate style="${component.style}" class="${component.cssClasses}"></vaadin-progress-bar>
    `
}

export const renderNotification = (component: ClientSideComponent) => {
    const metadata = component.metadata as Notification

    return html`
        <vaadin-notification
                theme="warning"
                duration="0"
                position="middle"
                .opened="${true}"
                ${notificationRenderer(notification => {
                    console.log(notification)
                    return html`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${metadata.title}</h3>
                        <div>
                            ${metadata.text}
                        </div>
                        <vaadin-button theme="tertiary-inline" aria-label="Close">
                            <vaadin-icon icon="lumo:cross"></vaadin-icon>
                        </vaadin-button>
                    </vaadin-horizontal-layout>
                `
                }, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-notification>
            `
}

export const renderMicroFrontend = (component: ClientSideComponent) => {
    const metadata = component.metadata as MicroFrontend

    return html`
        <mateu-api-caller>
        <mateu-ux baseUrl="${metadata.baseUrl}"  
                  route="${metadata.route}" 
                  consumedRoute="${metadata.consumedRoute}" 
                  id="${nanoid()}"
                  style="${component.style}" class="${component.cssClasses}"
        ></mateu-ux>
        </mateu-api-caller>
            `
}

export const renderMarkdown = (component: ClientSideComponent) => {
    const metadata = component.metadata as Markdown

    return html`
        <vaadin-markdown .content=${metadata.markdown}
                         style="${component.style}" class="${component.cssClasses}"></vaadin-markdown>
            `
}

export const renderMap = (component: ClientSideComponent) => {
    const metadata = component.metadata as Map

    return html`
        <vaadin-map src="${metadata.position}" zoom="${metadata.zoom}"
                    style="${component.style}" class="${component.cssClasses}"></vaadin-map>
            `
}

export const renderImage = (component: ClientSideComponent) => {
    const metadata = component.metadata as Image

    return html`
        <img src="${metadata.src}" style="${component.style}" class="${component.cssClasses}">
            `
}

export const renderDialog = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Dialog

    /*
                    @opened-changed="${(event: DialogOpenedChangedEvent) => {
                    this.dialogOpened = event.detail.value;
                }}"
     */
    return html`
        <vaadin-dialog
                header-title="User details"
                .opened="${true}"
                ${dialogHeaderRenderer(
                        () => html`
      <vaadin-button theme="tertiary" @click="${(e: Event) => console.log(e)}">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    `,
                        []
                )}
                ${dialogRenderer(dialog => {
                    console.log('dialog', dialog)
        return html`${renderComponent(metadata.content, baseUrl, data)}`
    }, [])}
                style="${component.style}" class="${component.cssClasses}"
        ></vaadin-dialog>
            `
}

export const renderDetails = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as Details

    return html`
        <vaadin-details summary="${metadata.title}" opened style="${component.style}" class="${component.cssClasses}">
            ${renderComponent(metadata.content, baseUrl, data)}
        </vaadin-details>
            `
}

export const renderCookieConsent = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as CookieConsent

    return html`
        <vaadin-cookie-consent style="${component.style}" class="${component.cssClasses}"></vaadin-cookie-consent>
    `
}

const mapItems = (options: MenuOption[]): any => {
    return options.map(option => {
        if (option.submenus) {
            return {
                text: option.label,
                route: option.destination?.route,
                selected: option.selected,
                children: mapItems(option.submenus)
            }
        }
        if (option.separator) {
            return {
                component: 'hr'
            }
        }
        return {
            text: option.label,
            route: option.destination?.route,
            selected: option.selected,
        }
    })
}

export const renderContextMenu = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as ContextMenu

    return html`
        <vaadin-context-menu .items=${mapItems(metadata.menu)} style="${component.style}" class="${component.cssClasses}">
            ${renderComponent(metadata.wrapped, baseUrl, data)}
        </vaadin-context-menu>
            `
}

export const renderConfirmDialog = (component: ClientSideComponent, baseUrl: string | undefined, data: any) => {
    const metadata = component.metadata as ConfirmDialog
    /*
            <vaadin-confirm-dialog
  header="${metadata.title}"
  cancel-button-visible
  reject-button-visible
  reject-text="Discard"
  confirm-text="Save"
  .opened="${this.dialogOpened}"
  @opened-changed="${this.openedChanged}"
  @confirm="${() => {
        this.status = 'Saved';
    }}"
  @cancel="${() => {
        this.status = 'Canceled';
    }}"
  @reject="${() => {
        this.status = 'Discarded';
    }}"
>

     */
    return html`
        <vaadin-confirm-dialog
  header="${metadata.title}"
  cancel-button-visible
  reject-button-visible
  reject-text="Discard"
  confirm-text="Save"
  .opened="${true}"
  style="${component.style}" class="${component.cssClasses}"
>
  ${metadata.text}
            ${component.children?.map(child => renderComponent(child, baseUrl, data))}
</vaadin-confirm-dialog>
            `
}

export const renderIcon = (component: ClientSideComponent) => {
    const metadata = component.metadata as Icon

    return html`
        <vaadin-icon icon="${metadata.icon}" style="${component.style}" class="${component.cssClasses}"></vaadin-icon>
    `
}

export const renderChart = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as Chart

    const columnOptions = { yAxis: { title: { text: '' } } }

    return html`
        <vaadin-chart
      type="column"
      .categories="${['Jan', 'Feb', 'Mar']}"
      .additionalOptions="${columnOptions}"
      style="${component.style}" class="${component.cssClasses}"
    >
      <vaadin-chart-series title="Tokyo" .values="${[49.9, 71.5, 106.4]}"></vaadin-chart-series>
      <vaadin-chart-series title="New York" .values="${[83.6, 78.8, 98.5]}"></vaadin-chart-series>
      <vaadin-chart-series title="London" .values="${[48.9, 38.8, 39.3]}"></vaadin-chart-series>
    </vaadin-chart>
    `
}

export const renderCard = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as Card
    return html`
        <vaadin-card style="${component.style}" class="${component.cssClasses}">
            <div slot="title">Lapland</div>
            <!-- tag::[] -->
            <div slot="subtitle">The Exotic North</div>
            <!-- end::[] -->
            <div>Lapland is the northern-most region of Finland and an active outdoor destination.</div>
        </vaadin-card>
    `
}

export const renderAnchor = (component: ClientSideComponent) => {
    const metadata = component.metadata as Anchor
    return html`<a href="${metadata.url}" style="${component.style}" class="${component.cssClasses}">${metadata.text}</a>`
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

export const renderButton = (component: ClientSideComponent) => {
    const metadata = component.metadata as Button
    return html`<vaadin-button
            data-action-id="${metadata.actionId}"
            @click="${handleButtonClick}"
            style="${component.style}" class="${component.cssClasses}">${metadata.label}</vaadin-button>`
}


export const renderBadge = (component: ClientSideComponent) => {
    const metadata = component.metadata as Badge
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}"
                      style="${component.style}" class="${component.cssClasses}">${metadata.text}</span>`
}

export const renderAvatar = (component: ClientSideComponent) => {
    const metadata = component.metadata as Avatar
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${metadata.name}"
            abbr="${metadata.abbreviation}"
            style="${component.style}" class="${component.cssClasses}"
    ></vaadin-avatar>`
}

export const renderAvatarGroup = (component: ClientSideComponent) => {
    const metadata = component.metadata as AvatarGroup
    return html`<vaadin-avatar-group max-items-visible="${metadata.maxItemsVisible}"
                                     .items="${metadata.avatars}"
                                     style="${component.style}" class="${component.cssClasses}">
    </vaadin-avatar-group>`
}

export const renderText = (component: ClientSideComponent, data: any) => {
    const metadata = component.metadata as Text
    let content = metadata.text;
    try {
        content = eval('`' + metadata.text + '`')
    } catch (e) {
        content = 'when evaluating ' + metadata.text + ' :' +  e + ', where data is ' + data
    }
    if (TextContainer.h1 == metadata.container) {
        return html`
            <h1 style="${component.style}" class="${component.cssClasses}">
                ${content}
            </h1>
        `
    }
    if (TextContainer.h2 == metadata.container) {
        return html`
            <h2 style="${component.style}" class="${component.cssClasses}">
                ${content}
            </h2>
        `
    }
    if (TextContainer.h3 == metadata.container) {
        return html`
            <h3 style="${component.style}" class="${component.cssClasses}">
                ${content}
            </h3>
        `
    }
    if (TextContainer.h4 == metadata.container) {
        return html`
            <h4 style="${component.style}" class="${component.cssClasses}">
                ${content}
            </h4>
        `
    }
    if (TextContainer.h5 == metadata.container) {
        return html`
            <h5 style="${component.style}" class="${component.cssClasses}">
                ${content}
            </h5>
        `
    }
    if (TextContainer.h6 == metadata.container) {
        return html`
            <h6 style="${component.style}" class="${component.cssClasses}">
                ${content}
            </h6>
        `
    }
    if (TextContainer.p == metadata.container) {
        return html`
               <p style="${component.style}" class="${component.cssClasses}">
                   ${content}
               </p>
            `
    }

    return html`
               <p>
                   Unknown text container: ${metadata.container} 
               </p>
            `
}

export const renderElement = (element: Element): TemplateResult => {
    let attributes = ''
    if (element.attributes) {
        for (let key in element.attributes) {
            // @ts-ignore
            attributes += ` ${key}="${element.attributes[key]}"`
        }
    }
    const h = `<${element.name}${attributes}>${element.content?element.content:''}<slot></slot></${element.name}>`
    return html`${unsafeHTML(h)}`
}

export const renderComponent = (component: Component, baseUrl: string | undefined, data: any): TemplateResult => {
    if (component.type == ComponentType.ClientSide ) {
        return renderClientSideComponent(component as ClientSideComponent, baseUrl, data)
    }
    return html`
        <mateu-component id="${component.id}" 
                                     .component="${component}"
                                     .values="${data}"
                                     baseUrl="${baseUrl}"
                         style="${component.style}" class="${component.cssClasses}">
       </mateu-component>`
}

export const renderClientSideComponent = (component: ClientSideComponent | undefined, baseUrl: string | undefined, data: any): TemplateResult => {
    if (component?.metadata) {

        if (component.metadata.type == ComponentMetadataType.FormLayout) {
            return renderFormLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.HorizontalLayout) {
            return renderHorizontalLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.VerticalLayout) {
            return renderVerticalLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.SplitLayout) {
            return renderSplitLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.MasterDetailLayout) {
            return renderMasterDetailLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.TabLayout) {
            return renderTabLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.AccordionLayout) {
            return renderAccordionLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.BoardLayout) {
            return renderBoardLayout(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.BoardLayoutRow) {
            return renderBoardLayoutRow(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.Scroller) {
            return renderScroller(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.FullWidth) {
            return renderFullWidth(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.Container) {
            return renderContainer(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.Form) {
            return html`<mateu-form 
                id="${component.id}" 
            baseUrl="${baseUrl}"
                .component="${component}"
                .values="${data}"
                style="${component.style}" class="${component.cssClasses}"
                >
                    ${component.children?.map(child => renderComponent(child, baseUrl, data))}        
                </mateu-form>`
        }
        if (component.metadata.type == ComponentMetadataType.Table) {
            return html`<mateu-table
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${data}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, data))}
                </mateu-table>`
        }
        if (component.metadata.type == ComponentMetadataType.TableCrud) {
            return html`<mateu-table-crud
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .component="${component}"
                .values="${data}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, data))}
             </mateu-table-crud>`
        }
        if (component.metadata.type == ComponentMetadataType.CardCrud) {
            return html`<mateu-table-crud
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${data}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, data))}
             </mateu-table-crud>`
        }

        if (component.metadata.type == ComponentMetadataType.Card) {
            return html`<mateu-card
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .metadata="${component.metadata}"
                .data="${data}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, data))}
             </mateu-card>`
        }

        if (component.metadata.type == ComponentMetadataType.App) {
            return html`<mateu-api-caller><mateu-app
                            id="${component.id}"
            baseUrl="${baseUrl}"
                .component="${component}"
                .data="${data}"
                            style="${component.style}" class="${component.cssClasses}"
                >
                 ${component.children?.map(child => renderComponent(child, baseUrl, data))}
             </mateu-app></mateu-api-caller>`
        }

        if (component.metadata.type == ComponentMetadataType.Element) {
            return renderElement(component.metadata as Element)
        }

        if (component.metadata.type == ComponentMetadataType.FormField) {
            return html`<mateu-field
                       id="${component.id}"
                .field="${component.metadata}"
                       .data="${data}"
                       style="${component.style}" class="${component.cssClasses}"
                >
                        ${component.children?.map(child => renderComponent(child, baseUrl, data))}
                    </mateu-field>`
        }
        if (component.metadata.type == ComponentMetadataType.Text) {
            return renderText(component, data)
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
            return renderConfirmDialog(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.ContextMenu) {
            return renderContextMenu(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.CookieConsent) {
            return renderCookieConsent(component)
        }
        if (component.metadata.type == ComponentMetadataType.Details) {
            return renderDetails(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.Dialog) {
            return renderDialog(component, baseUrl, data)
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
            return renderPopover(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.Tooltip) {
            return renderTooltip(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.MessageInput) {
            return renderMessageInput(component)
        }
        if (component.metadata.type == ComponentMetadataType.MessageList) {
            return renderMessageList(component)
        }
        if (component.metadata.type == ComponentMetadataType.CustomField) {
            return renderCustomField(component, baseUrl, data)
        }
        if (component.metadata.type == ComponentMetadataType.MenuBar) {
            return renderMenuBar(component)
        }
        if (component.metadata.type == ComponentMetadataType.Grid) {
            return renderGrid(component, data)
        }
        if (component.metadata.type == ComponentMetadataType.VirtualList) {
            return renderVirtualList(component)
        }
        return html`<p>Unknown metadata type ${component.metadata.type} for component ${component?.id}</p>`
    }
    return html`<p>No metadata for component ${component?.id}</p>`
}
