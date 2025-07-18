import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Markdown from "@mateu/shared/apiClients/dtos/componentmetadata/Markdown";
import { html } from "lit";

export const renderMarkdown = (component: ClientSideComponent) => {
    const metadata = component.metadata as Markdown

    return html`
        <vaadin-markdown .content=${metadata.markdown}
                         style="${component.style}" class="${component.cssClasses}"></vaadin-markdown>
            `
}