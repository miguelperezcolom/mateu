import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface GridColumn extends ComponentMetadata {

    id: string
    label: string
    align: string
    sortable: boolean
    filterable: boolean
    frozen: boolean
    frozenToEnd: boolean
    autoWidth: boolean
    flexGrow: string
    resizable: boolean
    width: string
    dataType: string
    stereotype: string
    tooltipPath: string
    actionId: string
    text: string
    style: string

}