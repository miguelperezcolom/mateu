import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Image from "@mateu/shared/apiClients/dtos/componentmetadata/Image";
import { html, nothing } from "lit";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { evalIfNecessary } from "@infra/ui/renderers/avatarRenderer.ts";

// src/alt may be ${…} templates over the page state (a YAML record page shows `${state.image}`),
// like Text and Avatar — and like the Redwood renderer, which already interpolated them
export const renderImage = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = component.metadata as Image
    const src = evalIfNecessary(metadata.src, state ?? {}, data ?? {})
    const alt = metadata.alt == null ? undefined : evalIfNecessary(metadata.alt, state ?? {}, data ?? {})
    return html`
        <img src="${src || nothing}" alt="${alt ?? nothing}" style="${component.style}" class="${component.cssClasses}"
             slot="${component.slot??nothing}">
            `
}
