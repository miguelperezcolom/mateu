import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Anchor from "@mateu/shared/apiClients/dtos/componentmetadata/Anchor";
import { html, nothing } from "lit";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'
import { interpolateFields } from '@infra/ui/interpolation.ts'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'

export const renderAnchor = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData) => {
    const metadata = interpolateFields(component.metadata as Anchor, ['url', 'text'], state, data)
    return html`<a href="${ifDefined(safeHref(metadata.url))}" target="${metadata.target ?? nothing}"
                   rel="${metadata.target === '_blank' ? 'noopener' : nothing}"
                   style="${component.style}" class="${component.cssClasses}"
                   slot="${component.slot??nothing}">${metadata.text}</a>`
}