import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Markdown from "@mateu/shared/apiClients/dtos/componentmetadata/Markdown";
import { html, nothing } from "lit";

export const renderMarkdown = (component: ClientSideComponent) => {
    const metadata = component.metadata as Markdown

    // Cap prose to a comfortable reading measure (~72ch ≈ 700-800px, within the 45-75 chars/line
    // guideline) so long-form text doesn't stretch the full page width and hurt legibility. It's a
    // DEFAULT: a developer's @Style (component.style) comes last and can override (e.g. max-width:none
    // for full-bleed markdown). max-width alone leaves narrow screens at container width.
    return html`
        <mateu-markdown .content=${metadata.markdown}
                        style="display:block; max-width: 72ch; ${component.style ?? ''}" class="${component.cssClasses}"
                        slot="${component.slot??nothing}"></mateu-markdown>
            `
}