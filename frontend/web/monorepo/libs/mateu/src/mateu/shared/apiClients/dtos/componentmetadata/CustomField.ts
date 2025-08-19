import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface CustomField extends ComponentMetadata {

    label: string
    content: Component

}