import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Details extends ComponentMetadata {

    summary: Component
    content: Component
    opened: boolean

}