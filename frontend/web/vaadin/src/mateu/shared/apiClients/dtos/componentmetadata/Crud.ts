import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";

export default interface Crud extends ComponentMetadata {

    id: string
    title: string
    subtitle: string
    searchable: boolean
    filters: FormField[]
    table: Table
    actions: Action[]
    pageSize: number,
    clientSidePagination: boolean
    searchOnEnter: boolean
    autoFocusOnSearchText: boolean

}