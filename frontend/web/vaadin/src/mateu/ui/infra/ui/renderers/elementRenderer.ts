import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { html, TemplateResult } from "lit";
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

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