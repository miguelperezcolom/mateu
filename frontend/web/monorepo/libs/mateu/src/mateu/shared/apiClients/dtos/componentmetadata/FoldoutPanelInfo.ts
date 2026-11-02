export default interface FoldoutPanelInfo {

    title?: string
    subtitle?: string
    icon?: string
    open?: boolean
    /** Optional CSS length for the expanded panel (e.g. "40rem"); unset = renderer default width. */
    width?: string
    /** The author wrote no `open:`: open while it fits the row, else folded (`open` is ignored). */
    autoOpen?: boolean
    /** The visual editor's node id of the panel (editor preview only, never on a production wire). */
    id?: string

}
