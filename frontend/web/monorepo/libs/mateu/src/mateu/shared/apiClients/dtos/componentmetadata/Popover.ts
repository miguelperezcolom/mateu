import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Popover extends ComponentMetadata {

    wrapped: Component
    content: Component

}