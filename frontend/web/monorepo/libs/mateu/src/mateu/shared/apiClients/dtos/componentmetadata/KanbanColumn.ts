import KanbanCard from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanCard";

export default interface KanbanColumn {
    id?: string
    title?: string
    color?: string
    cards?: KanbanCard[]
}
