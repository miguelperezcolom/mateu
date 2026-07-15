import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Text from "@mateu/shared/apiClients/dtos/componentmetadata/Text";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";
import { html, nothing } from "lit";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { interpolateNested } from "@infra/ui/interpolation.ts";
export const renderText = (component: ClientSideComponent, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as Text
    const colspan = metadata.attributes?.['data-colspan']
    const content = interpolateNested(metadata.text, state, data, appState, appData)
    // Text size (xl/l/s/xs enlarge or reduce the font; m or absent applies nothing) and
    // noMargins (drops the container's block margins, e.g. a default <p> margin dwarfing an xs
    // caption) — two independent @Text parameters.
    const SIZE_VARS: Record<string, string> = {
        xl: 'var(--lumo-font-size-xl, 1.375rem)',
        l: 'var(--lumo-font-size-l, 1.125rem)',
        s: 'var(--lumo-font-size-s, .875rem)',
        xs: 'var(--lumo-font-size-xs, .8125rem)',
    }
    const sizeStyle = (metadata.size && SIZE_VARS[metadata.size] ? `font-size: ${SIZE_VARS[metadata.size]}; ` : '')
        + (metadata.noMargins ? 'margin-block-start: 0; margin-block-end: 0; ' : '')
    if (TextContainer.h1 == metadata.container) {
        return html`
            <h1 style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h1>
        `
    }
    if (TextContainer.h2 == metadata.container) {
        return html`
            <h2 style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h2>
        `
    }
    if (TextContainer.h3 == metadata.container) {
        return html`
            <h3 style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h3>
        `
    }
    if (TextContainer.h4 == metadata.container) {
        return html`
            <h4 style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h4>
        `
    }
    if (TextContainer.h5 == metadata.container) {
        return html`
            <h5 style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h5>
        `
    }
    if (TextContainer.h6 == metadata.container) {
        return html`
            <h6 style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                id="${ifDefined(component.id)}"
                data-colspan="${ifDefined(colspan)}"
                slot="${component.slot??nothing}">
                ${content??nothing}
            </h6>
        `
    }
    if (TextContainer.p == metadata.container) {
        return html`
               <p style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                  id="${ifDefined(component.id)}"
                  data-colspan="${ifDefined(colspan)}"
                  slot="${component.slot??nothing}">
                   ${content??nothing}
               </p>
            `
    }
    if (TextContainer.div == metadata.container) {
        return html`
               <div style="${sizeStyle}${component.style}" class="${component.cssClasses}"
                    id="${ifDefined(component.id)}"
                    data-colspan="${ifDefined(colspan)}"
                    slot="${component.slot??nothing}">${content?unsafeHTML(content):nothing}</div>
            `
    }
    if (TextContainer.span == metadata.container) {
        return html`
               <span style="${sizeStyle}${component.style}" class="${component.cssClasses}"
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
