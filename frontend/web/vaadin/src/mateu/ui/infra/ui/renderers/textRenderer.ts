import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";
import { html } from "lit";

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
