import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { html, LitElement } from "lit";
import CarouselLayout from "@mateu/shared/apiClients/dtos/componentmetadata/CarouselLayout";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import '@infra/ui/mateu-carousel.ts'

export const renderCarouselLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as CarouselLayout

    return html`
        <mateu-carousel
                id="${component.id}"
                ?dots="${metadata.dots}"
                ?nav="${metadata.nav}"
                ?loop="${metadata.loop}"
                ?auto="${metadata.auto}"
                ?disable-keys="${metadata.disableKeys}"
                .duration="${metadata.duration ?? 4000}"
                .selected="${metadata.selected ?? 0}"
                style="${component.style}"
                class="${component.cssClasses}"
        >
            ${component.children?.map(component => html`<div>${renderComponent(container, component, baseUrl, state, data, appState, appData)}</div>`)}
        </mateu-carousel>
    `
}
