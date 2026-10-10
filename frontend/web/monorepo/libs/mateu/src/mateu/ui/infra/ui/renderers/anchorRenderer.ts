import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Anchor from "@mateu/shared/apiClients/dtos/componentmetadata/Anchor";
import { html, nothing } from "lit";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'

export const renderAnchor = (component: ClientSideComponent) => {
    const metadata = component.metadata as Anchor
    return html`<a href="${ifDefined(safeHref(metadata.url))}" target="${metadata.target ?? nothing}"
                   rel="${metadata.target === '_blank' ? 'noopener' : nothing}"
                   style="${component.style}" class="${component.cssClasses}"
                   slot="${component.slot??nothing}">${metadata.text}</a>`
}