import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Tooltip extends ComponentMetadata {

    wrapped: Component
    text: string

}