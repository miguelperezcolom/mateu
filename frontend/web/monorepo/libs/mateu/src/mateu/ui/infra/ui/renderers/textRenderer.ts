import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";
import { html, nothing } from "lit";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {ifDefined} from "lit/directives/if-defined.js";

export const renderText = (component: ClientSideComponent, state: any, data: any, appState: any, appData: any) => {
    const metadata = component.metadata as Text
    let content = metadata.text
    const colspan = metadata.attributes?.['data-colspan']

    if (content) {
        try {
            content = eval('`' + metadata.text + '`')
        } catch (e) {
            content = 'when evaluating ' + metadata.text + ' :' +  e + ', where data is ' + data
                + ' and state is ' + state + ' and app state is ' + appState + ' and app data is ' + appData
        }
    }
    if (TextContainer.h1 == metadata.container) {
        return html`
            <h1 style="${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h1>
        `
    }
    if (TextContainer.h2 == metadata.container) {
        return html`
            <h2 style="${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h2>
        `
    }
    if (TextContainer.h3 == metadata.container) {
        return html`
            <h3 style="${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h3>
        `
    }
    if (TextContainer.h4 == metadata.container) {
        return html`
            <h4 style="${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h4>
        `
    }
    if (TextContainer.h5 == metadata.container) {
        return html`
            <h5 style="${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h5>
        `
    }
    if (TextContainer.h6 == metadata.container) {
        return html`
            <h6 style="${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h6>
        `
    }
    if (TextContainer.p == metadata.container) {
        return html`
               <p style="${component.style}" class="${component.cssClasses}"
                  id="${ifDefined(component.id)}"
                  data-colspan="${ifDefined(colspan)}"
                  slot="${component.slot??nothing}">
                   ${content??nothing}
               </p>
            `
    }
    if (TextContainer.div == metadata.container) {
        return html`
               <div style="${component.style}" class="${component.cssClasses}"
                    id="${ifDefined(component.id)}"
                    data-colspan="${ifDefined(colspan)}"
                    slot="${component.slot??nothing}">${content?unsafeHTML(content):nothing}</div>
            `
    }
    if (TextContainer.span == metadata.container) {
        return html`
               <span style="${component.style}" class="${component.cssClasses}"
                     id="${ifDefined(component.id)}"
                     data-colspan="${ifDefined(colspan)}"
                    slot="${component.slot??nothing}">${content??nothing}</span>
            `
    }
    return html`
               <p
                       id="${ifDefined(component.id)}"
                       data-colspan="${ifDefined(colspan)}"
                       slot="${component.slot??nothing}">
                   Unknown text container: ${metadata.container} 
               </p>
            `
}
