import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import Field from "@mateu/shared/apiClients/dtos/componentmetadata/Field";
import Action from "@mateu/shared/apiClients/dtos/componentmetadata/Action";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";

export default interface Crud extends ComponentMetadata {

    id: string
    title: string
    subtitle: string
    searchable: boolean
    filters: Field[]
    table: Table
    actions: Action[]
    pageSize: number,
    clientSidePagination: boolean

}