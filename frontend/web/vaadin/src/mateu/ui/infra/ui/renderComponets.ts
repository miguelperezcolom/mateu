import Component from "@mateu/shared/apiClients/dtos/Component";
import { html } from "lit";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";

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
    if (TextContainer.h7 == metadata.container) {
        return html`
            <h7>
                ${metadata.text}
            </h7>
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