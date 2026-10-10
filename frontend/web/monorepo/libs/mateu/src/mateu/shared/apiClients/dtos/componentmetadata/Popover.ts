import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Popover extends ComponentMetadata {

    wrapped: Component
    /** click (default) or hover — hover opens on hover and focus, non-modal */
    trigger?: "click" | "hover"
    content: Component

}