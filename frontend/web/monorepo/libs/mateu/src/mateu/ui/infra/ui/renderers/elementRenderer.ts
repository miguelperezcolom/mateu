import Element from "@mateu/shared/apiClients/dtos/componentmetadata/Element";
import { html, LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { MateuComponent } from "@infra/ui/mateu-component.ts";

const serialize = (e: any) => {
    if (e instanceof CustomEvent) {
        return e.detail
    }
    const result: Record<string, any> = {}
    for (const k in e) {
        const v = e[k]
        if (['number', 'string', 'boolean'].indexOf(typeof v) >= 0) {
            result[k] = e[k]
        }
    }
    return result
}

const hydrate = (htmlElement: any, element: Element, component: ClientSideComponent) => {
    for (let k in element.attributes) {
        htmlElement.setAttribute(k, element.attributes[k])
    }
    if (component.style) {
        htmlElement.setAttribute('style', component.style)
    }
    if (component.cssClasses) {
        htmlElement.setAttribute('class', component.cssClasses)
    }
    if (component.slot) {
        htmlElement.setAttribute('slot', component.slot)
    }
    if (element.content) {
        htmlElement.append(element.content)
    }
}

export const renderElement = (container: LitElement, element: Element, component: ClientSideComponent): TemplateResult => {
    let selector = element.name
    if (element.attributes && element.attributes['id']) {
        selector = '#' + element.attributes['id']
    }
    setTimeout(() => {
        const htmlElement = container.shadowRoot?.querySelector('.element-container')?.querySelector(selector)
        if (!htmlElement) {
            const htmlElement = document.createElement(element.name);
            hydrate(htmlElement, element, component)
            for (let k in element.on) {
                htmlElement.addEventListener(k, (e: Event) => {
                    const parameter = serialize(e)
                    const mateuComponent = container as MateuComponent
                    mateuComponent.manageActionRequestedEvent(new CustomEvent('action-requested', {
                        detail: {
                            actionId: element.on[k],
                            parameters: {
                                event: parameter
                            }
                        },
                        bubbles: true,
                        composed: true
                    }))
                })
            }
            container.shadowRoot?.querySelector('.element-container')?.appendChild(htmlElement)
        } else {
            while (htmlElement.firstChild) {
                htmlElement.removeChild(htmlElement.lastChild!);
            }
            hydrate(htmlElement, element, component)
        }
    })
    return html`<div class="element-container"></div>`
}