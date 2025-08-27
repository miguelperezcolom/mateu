import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField";
import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";

export default interface Crud extends Table {

    id: string
    title: string
    subtitle: string
    searchable: boolean
    filters: FormField[]
    toolbar: Button[]
    pageSize: number,
    clientSidePagination: boolean
    searchOnEnter: boolean
    autoFocusOnSearchText: boolean

}