import ComponentMetadata from "./ComponentMetadata";
import Column from "./Column";
import Action from "./Action";
import Component from "./Component";

export default interface Crud extends ComponentMetadata {

    title: string
    subtitle: string
    canEdit: boolean
    selectionListened: boolean
    hasActionOnSelectedRow: boolean
    multipleRowSelectionEnabled: boolean
    searchable: boolean
    showCards: boolean
    searchForm: Component
    columns: Column[]
    actions: Action[]
    child: boolean

}
