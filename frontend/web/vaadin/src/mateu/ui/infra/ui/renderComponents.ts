import Component from "@mateu/shared/apiClients/dtos/Component";
import { html, nothing } from "lit";
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

export const renderProgressBar = (component: Component) => {
    const metadata = component.metadata as ProgressBar

    return html`
        <vaadin-progress-bar indeterminate></vaadin-progress-bar>
    `
}

export const renderNotification = (component: Component) => {
    const metadata = component.metadata as Notification

    return html`
        <vaadin-notification
                theme="warning"
                duration="0"
                position="middle"
                .opened="${true}"
                ${notificationRenderer(notification => html`
                    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                        <h3>${metadata.title}</h3>
                        <div>
                            ${metadata.text}
                        </div>
                        <vaadin-button theme="tertiary-inline" aria-label="Close">
                            <vaadin-icon icon="lumo:cross"></vaadin-icon>
                        </vaadin-button>
                    </vaadin-horizontal-layout>
                `, [])}
        ></vaadin-notification>
            `
}

export const renderMicroFrontend = (component: Component) => {
    const metadata = component.metadata as MicroFrontend

    return html`
        <mateu-api-caller>
        <mateu-ux baseUrl="${metadata.baseUrl}"  route="${metadata.route}" consumedRoute="${metadata.consumedRoute}" id="${nanoid()}"></mateu-ux>
        </mateu-api-caller>
            `
}

export const renderMarkdown = (component: Component) => {
    const metadata = component.metadata as Markdown

    return html`
        <vaadin-markdown .content=${metadata.markdown}></vaadin-markdown>
            `
}

export const renderMap = (component: Component) => {
    const metadata = component.metadata as Map

    return html`
        <vaadin-map src="${metadata.position}" zoom="${metadata.zoom}" style="width: 400px; height: 400px;"></vaadin-map>
            `
}

export const renderImage = (component: Component) => {
    const metadata = component.metadata as Image

    return html`
        <img src="${metadata.src}">
            `
}

export const renderDialog = (component: Component, renderComponent: Function) => {
    const metadata = component.metadata as Details

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
      <vaadin-button theme="tertiary" @click="${(e) => console.log(e)}">
        <vaadin-icon icon="lumo:cross"></vaadin-icon>
      </vaadin-button>
    `,
                        []
                )}
                ${dialogRenderer(dialog => html`${renderComponent(metadata.content)}`, [])}
        ></vaadin-dialog>
            `
}

export const renderDetails = (component: Component, renderComponent: Function) => {
    const metadata = component.metadata as Details

    return html`
        <vaadin-details summary="${metadata.title}" opened>
            ${renderComponent(metadata.content)}
        </vaadin-details>
            `
}

export const renderCookieConsent = (component: Component) => {
    const metadata = component.metadata as CookieConsent

    return html`
        <vaadin-cookie-consent></vaadin-cookie-consent>
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

export const renderContextMenu = (component: Component, renderComponent: Function) => {
    const metadata = component.metadata as ContextMenu

    return html`
        <vaadin-context-menu .items=${mapItems(metadata.menu)}>
            ${renderComponent(metadata.wrapped)}
        </vaadin-context-menu>
            `
}

export const renderConfirmDialog = (component: Component, renderComponent: Function) => {
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
>
  ${metadata.text}
            ${component.children?.map(child => renderComponent(child))}
</vaadin-confirm-dialog>
               <vaadin-scroller>
                   
               </vaadin-scroller>
            `
}

export const renderIcon = (component: Component) => {
    const metadata = component.metadata as Icon

    return html`
        <vaadin-icon icon="${metadata.icon}"></vaadin-icon>
    `
}

export const renderChart = (component: Component) => {
    const metadata = component.metadata as Chart

    const columnOptions = { yAxis: { title: { text: '' } } }

    return html`
        <vaadin-chart
      type="column"
      .categories="${['Jan', 'Feb', 'Mar']}"
      .additionalOptions="${columnOptions}"
      style="width: 300px;"
    >
      <vaadin-chart-series title="Tokyo" .values="${[49.9, 71.5, 106.4]}"></vaadin-chart-series>
      <vaadin-chart-series title="New York" .values="${[83.6, 78.8, 98.5]}"></vaadin-chart-series>
      <vaadin-chart-series title="London" .values="${[48.9, 38.8, 39.3]}"></vaadin-chart-series>
    </vaadin-chart>
    `
}

export const renderCard = (component: Component) => {
    const metadata = component.metadata as Card
    return html`
        <vaadin-card>
            <div slot="title">Lapland</div>
            <!-- tag::[] -->
            <div slot="subtitle">The Exotic North</div>
            <!-- end::[] -->
            <div>Lapland is the northern-most region of Finland and an active outdoor destination.</div>
        </vaadin-card>
    `
}

export const renderAnchor = (component: Component) => {
    const metadata = component.metadata as Anchor
    return html`<a href="${metadata.url}">${metadata.text}</a>`
}

export const renderButton = (component: Component) => {
    const metadata = component.metadata as Button
    return html`<vaadin-button>${metadata.label}</vaadin-button>`
}


export const renderBadge = (component: Component) => {
    const metadata = component.metadata as Badge
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}">${metadata.text}</span>`
}

export const renderAvatar = (component: Component) => {
    const metadata = component.metadata as Avatar
    return html`<vaadin-avatar
            img="${metadata.image}"
            name="${metadata.name}"
            abbr="${metadata.abbreviation}"
    ></vaadin-avatar>`
}

export const renderAvatarGroup = (component: Component) => {
    const metadata = component.metadata as AvatarGroup
    return html`<vaadin-avatar-group max-items-visible="${metadata.maxItemsVisible}"
                                     .items="${metadata.avatars}">
    </vaadin-avatar-group>`
}

export const renderText = (component: Component) => {
    const metadata = component.metadata as Text
    if (TextContainer.h1 == metadata.container) {
        return html`
            <h1>
                ${metadata.text}
            </h1>
        `
    }
    if (TextContainer.h2 == metadata.container) {
        return html`
            <h2>
                ${metadata.text}
            </h2>
        `
    }
    if (TextContainer.h3 == metadata.container) {
        return html`
            <h3>
                ${metadata.text}
            </h3>
        `
    }
    if (TextContainer.h4 == metadata.container) {
        return html`
            <h4>
                ${metadata.text}
            </h4>
        `
    }
    if (TextContainer.h5 == metadata.container) {
        return html`
            <h5>
                ${metadata.text}
            </h5>
        `
    }
    if (TextContainer.h6 == metadata.container) {
        return html`
            <h6>
                ${metadata.text}
            </h6>
        `
    }
    if (TextContainer.p == metadata.container) {
        return html`
               <p>
                   ${metadata.text}
               </p>
            `
    }

    return html`
               <p>
                   Unknown text container: ${metadata.container} 
               </p>
            `
}