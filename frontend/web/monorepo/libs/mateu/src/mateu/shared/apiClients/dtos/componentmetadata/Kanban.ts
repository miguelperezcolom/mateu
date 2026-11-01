import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import KanbanColumn from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanColumn";
import KanbanCard from "@mateu/shared/apiClients/dtos/componentmetadata/KanbanCard";
import RestDataSource from "@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts";

export default interface Kanban extends ComponentMetadata {
    columns?: KanbanColumn[]
    /** The action a dropped card runs; absent = the cards do not move. */
    moveActionId?: string
    /** A LIVE board: the source whose items are its cards. */
    rowsSource?: RestDataSource
    /** The item field naming a card's column (default `status`). */
    columnField?: string
    /** Template of a card drawn from an item (`${row.x}`). */
    card?: KanbanCard
    /** A card colour that names a key here takes its value. */
    cardColors?: Record<string, string>
    /** Where a card from the source goes when clicked (`tasks/${row.id}`). */
    cardRoute?: string
    /** The item field that orders a column's cards; a move sends its new value (`_toOrder`). */
    orderField?: string
}
