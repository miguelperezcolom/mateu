import { LitElement, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import CustomComponent from "@mateu/shared/apiClients/dtos/componentmetadata/CustomComponent";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { resolveCustomComponent } from "@infra/ui/renderers/customComponentRegistry.ts";
import { renderUnsupported } from "@infra/ui/renderers/unsupportedRenderer.ts";

/**
 * Renders a custom component (coherence-plan #14): look the type `name` up in the custom-component
 * registry and, if a renderer is registered, hand it the declared `props` and the already-rendered
 * slotted `children`. When none is registered, degrade to the <mateu-unsupported> placeholder — a
 * custom component is a NEW rendering and does NOT port for free, so the gap is shown, not hidden.
 */
export const renderCustomComponent = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData
): TemplateResult => {
    const metadata = component.metadata as CustomComponent;
    const children =
        component.children?.map((child) =>
            renderComponent(container, child, baseUrl, state, data, appState, appData, false)
        ) ?? [];
    const renderer = resolveCustomComponent(metadata.name);
    if (renderer) {
        return renderer(metadata.props ?? {}, children);
    }
    // No renderer registered for this custom type — show the gap rather than break the screen.
    return renderUnsupported(
        component,
        `${ComponentMetadataType.CustomComponent}:${metadata.name}` as ComponentMetadataType,
        "custom-component-registry"
    );
};
