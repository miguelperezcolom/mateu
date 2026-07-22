import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList";
import { html, LitElement, nothing } from "lit";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";

/**
 * Design-system-neutral VirtualList renderer: a plain scrollable container that renders every
 * item through the shared component renderer. No virtualization and no `@vaadin` dependency, so
 * it is the safe default for any renderer. A design-system app that wants windowed virtualization
 * (e.g. the Vaadin adapter's renderVirtualList, using vaadin-virtual-list) overrides
 * ComponentMetadataType.VirtualList in its own renderClientSideComponent.
 */
export const renderVirtualList = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) => {
    const metadata = component.metadata as VirtualList
    return html`
        <div
                style="display: flex; flex-direction: column; overflow: auto; ${component.style}"
                class="${component.cssClasses}"
                slot="${component.slot ?? nothing}"
        >
            ${metadata.page.content.map((item: any) => renderComponent(container, item, baseUrl, state, data, appState, appData))}
        </div>
    `
}
