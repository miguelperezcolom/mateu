import { Page } from "@mateu/shared/apiClients/dtos/Page";

/**
 * Per-group summary the server sends next to the page when the listing is grouped
 * (`Crud.groupBy`): one entry per group, in listing order, with the aggregates of each
 * aggregated column over the WHOLE filtered set of that group (not just the current page).
 */
export interface GroupSummary {
    value: string
    count: number
    aggregates: Record<string, number>
    /** Ids of the @GroupAction buttons this group must NOT show (absent = all visible). */
    hiddenActions?: string[]
}

/**
 * The listing/search result envelope the crud stores as its rows source (`data[crudId]`
 * in the search response). `aggregates` carries the totals of each aggregated column
 * (`GridColumn.aggregate`) over the WHOLE filtered set; `groups` the per-group summaries.
 */
export interface ListingData {
    page?: Page
    aggregates?: Record<string, number>
    groups?: GroupSummary[]
}
