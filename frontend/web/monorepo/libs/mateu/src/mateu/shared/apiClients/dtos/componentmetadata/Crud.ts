import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/RemoteCoordinates.ts";

export default interface Crud extends Table {

    crudlType: string
    id: string
    title: string
    subtitle: string
    searchable: boolean
    filters: FormField[]
    toolbar: Button[]
    clientSidePagination: boolean
    searchOnEnter: boolean
    autoFocusOnSearchText: boolean

}