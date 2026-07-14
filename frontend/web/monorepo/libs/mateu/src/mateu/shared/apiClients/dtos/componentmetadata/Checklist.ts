import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ChecklistItem from "@mateu/shared/apiClients/dtos/componentmetadata/ChecklistItem";

export default interface Checklist extends ComponentMetadata {
    title?: string
    items?: ChecklistItem[]
}
