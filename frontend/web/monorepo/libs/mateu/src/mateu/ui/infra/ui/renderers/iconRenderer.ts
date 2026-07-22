import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import Icon from "@mateu/shared/apiClients/dtos/componentmetadata/Icon";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";

// The Icon component → the neutral icon port (delegates to the active renderer's icon hook; the core stays
// @vaadin-free — the Vaadin adapter maps to a vaadin-icon element).
export const renderIcon = (component: ClientSideComponent) => {
    const metadata = component.metadata as Icon
    return icon(metadata.icon, component.style, component.cssClasses, component.slot)
}
