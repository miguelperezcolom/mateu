import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { html, nothing } from "lit";
import {evalIfNecessary} from "@infra/ui/renderers/avatarRenderer.ts";

export const renderBadge = (component: ClientSideComponent, state: any, data: any) => {
    const metadata = component.metadata as Badge
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}"
                      style="${component.style}" class="${component.cssClasses}"
                      slot="${component.slot??nothing}">${evalIfNecessary(metadata.text, state, data)}</span>`
}

export const renderBadgeMetadata = (metadata: Badge) => {
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}">${metadata.text}</span>`
}