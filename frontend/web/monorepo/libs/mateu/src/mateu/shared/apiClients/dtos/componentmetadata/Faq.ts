import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import FaqItem from "@mateu/shared/apiClients/dtos/componentmetadata/FaqItem";

export default interface Faq extends ComponentMetadata {
    items?: FaqItem[]
}
