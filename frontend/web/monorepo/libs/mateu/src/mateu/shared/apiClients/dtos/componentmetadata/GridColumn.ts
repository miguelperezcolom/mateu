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
    /** Rich `primary` column (coherence-plan #6): the row field for the secondary caption line,
     *  and the one for the leading avatar/icon. Set only when stereotype === 'primary'. */
    captionPath?: string
    leadingPath?: string
    style: string
    priority: number
    identifier: boolean
    editable: boolean
    editorType: string | undefined
    editorOptions: { value: any, label: string }[] | undefined
    weight: number | null
    /** Aggregate function totalled over the whole filtered set (and per group when grouping). */
    aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count'

}