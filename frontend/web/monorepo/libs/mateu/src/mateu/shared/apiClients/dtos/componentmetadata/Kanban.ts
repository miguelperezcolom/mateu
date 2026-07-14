import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import KanbanColumn from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanColumn";

export default interface Kanban extends ComponentMetadata {
    columns?: KanbanColumn[]
}
