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
    /** Multi-line rows (`@Line`): the 1-based line of the row this column is drawn on.
     *  Absent/1 = the ordinary columns; a listing with any column on a line > 1 draws each row
     *  on several lines (line 1 as columns, the rest as «Label: value» under it). */
    line?: number | null
    /** A status column's badge tone per VALUE (`OPEN: warning`): success | warning | danger | info |
     *  neutral. Usually supplied by a field type (types.yaml). A value not listed reads by its word. */
    tones?: Record<string, string> | null
    /** What each raw VALUE reads as (`IN_HOUSE: "In house"`) — an enum column's labels, the same
     *  its form options use. Display only: the row keeps the raw value. */
    valueLabels?: Record<string, string> | null
}
