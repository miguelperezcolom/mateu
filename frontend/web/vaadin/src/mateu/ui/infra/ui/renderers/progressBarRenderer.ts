import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import ProgressBar from "@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar";
import { html } from "lit";

export const renderProgressBar = (component: ClientSideComponent) => {
    // @ts-ignore
    const metadata = component.metadata as ProgressBar

    return html`
        <vaadin-progress-bar indeterminate style="${component.style}" class="${component.cssClasses}"></vaadin-progress-bar>
    `
}