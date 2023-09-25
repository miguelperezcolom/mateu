import ViewMetadata from "./ViewMetadata";
import SearchForm from "./SearchForm";
import Column from "./Column";
import Form from "./Form";
import Action from "./Action";

export default interface Crud extends ViewMetadata {

    listId: string;

    title: string;

    subtitle: string;

    searchForm: SearchForm;

    columns: Column[];

    canEdit: boolean;

    newItemForm: Form;

    detailForm: Form;

    actions: Action[];

}
