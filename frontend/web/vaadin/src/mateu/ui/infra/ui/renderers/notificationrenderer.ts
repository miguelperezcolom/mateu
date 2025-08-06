import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Notification from "@mateu/shared/apiClients/dtos/componentmetadata/Notification";
import { html, nothing } from "lit";
import { notificationRenderer } from "@vaadin/notification/lit";

export const renderNotification = (component: ClientSideComponent) => {
    const metadata = component.metadata as Notification

    return html`
        <vaadin-notification
                theme="warning"
                duration="0"
                position="middle"
                .opened="${true}"
                slot="${component.slot??nothing}"
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
