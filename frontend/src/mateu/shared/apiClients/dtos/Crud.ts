import ComponentMetadata from "./ComponentMetadata";
import SearchForm from "./SearchForm";
import Column from "./Column";
import Action from "./Action";

export default interface Crud extends ComponentMetadata {

    title: string
    subtitle: string
    canEdit: boolean
    searchable: boolean
    searchForm: SearchForm
    columns: Column[]
    actions: Action[]
    child: boolean

}
