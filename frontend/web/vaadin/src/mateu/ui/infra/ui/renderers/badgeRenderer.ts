import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { html, nothing } from "lit";

export const renderBadge = (component: ClientSideComponent) => {
    const metadata = component.metadata as Badge
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}"
                      style="${component.style}" class="${component.cssClasses}"
                      slot="${component.slot??nothing}">${metadata.text}</span>`
}