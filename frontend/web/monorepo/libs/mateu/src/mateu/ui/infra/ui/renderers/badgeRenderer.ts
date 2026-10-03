import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Badge from "@mateu/shared/apiClients/dtos/componentmetadata/Badge";
import { html, nothing } from "lit";
import {evalIfNecessary} from "@infra/ui/renderers/avatarRenderer.ts";

export const renderBadge = (component: ClientSideComponent, state: ComponentState, data: ComponentData) => {
    const metadata = component.metadata as Badge
    return html`<span theme="badge ${metadata.color} ${metadata.pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}"
                      style="${component.style}" class="${component.cssClasses}"
                      slot="${component.slot??nothing}">${evalIfNecessary(metadata.text, state, data)}</span>`
}

/**
 * A badge given as metadata (a page's / record's status badges). `opts.pill` draws it as a pill
 * whatever the metadata says: the content header does, so a status reads the same on the record as
 * in the listing's grid, where status badges are pills.
 */
export const renderBadgeMetadata = (metadata: Badge, state: ComponentState, data: ComponentData, opts?: { pill?: boolean }) => {
    const text = evalIfNecessary(metadata.text, state, data)
    if (!text) return nothing
    let color = evalIfNecessary(metadata.color, state, data);
    if (color == 'SUCCESS') color = 'success';
    if (color == 'ERROR') color = 'error';
    if (color == 'DANGER') color = 'error';
    if (color == 'WARNING') color = 'warning';
    if (color == 'INFO') color = 'info';
    if (color == 'PRIMARY') color = 'primary';
    if (color == 'SECONDARY') color = 'secondary';
    if (color == 'TERTIARY') color = 'tertiary';
    if (color == 'QUATERNARY') color = 'quaternary';
    if (color == 'LIGHT') color = 'light';
    if (color == 'DARK') color = 'dark';
    const pill = metadata.pill || opts?.pill
    return html`<span theme="badge ${color} ${pill?'pill':''} ${metadata.small?'small':''} ${metadata.primary?'primary':''}">${text}</span>`
}