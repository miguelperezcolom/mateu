import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement } from "lit";
import CarouselLayout from "@mateu/shared/apiClients/dtos/componentmetadata/CarouselLayout";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";

export const renderCarouselLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any) => {
    const metadata = component.metadata as CarouselLayout

    return html`
        <skeleton-carousel 
                id="${component.id}"
                ?dots = "${metadata.dots}" 
                ?nav = "${metadata.nav}" 
                ?loop = "${metadata.loop}"
                style="${component.style}"
                css="${component.cssClasses}"
        >
            ${component.children?.map(component => html`<div>${renderComponent(container, component, baseUrl, state, data, appState, appData)}</div>`)}
        </skeleton-carousel>
    `
}