import Component from "@mateu/shared/apiClients/dtos/Component";
import Rule from "@mateu/shared/apiClients/dtos/componentmetadata/Rule";

export default interface MenuOption {
    label: string
    actionId: string | undefined
    selected: boolean
    submenus: MenuOption[]
    separator: boolean
    component: Component
    className: string
    disabled: boolean
    disabledOnClick: boolean
    itemData: unknown
    icon: string,

    remote: boolean

    // false for an option that travels but is not drawn: a hidden remote section
    // (`@Menu @Hidden RemoteMenu`), which resolves deep links on the server and has no entry
    visible?: boolean

    path: string

    // A remote section only (remote: true). The route prefix its screens live under, as far as the
    // shell can tell before the remote answers — so the active section and the first breadcrumb
    // are known on a cold load. Older servers do not send it: `path` stands in.
    routePrefix?: string
    // A remote section only: the shell declared this label, and it wins over the remote's.
    shellLabel?: boolean
    // Client-side only: a remote section whose remote did not answer. Drawn disabled, with
    // `description` saying why; retried in the background.
    unavailable?: boolean

    baseUrl: string
    route: string
    consumedRoute: string
    serverSideType: string | undefined
    params: Record<string, unknown>
    explode: boolean
    uriPrefix: string | undefined
    description: string | undefined

    // The entry opens a listing: how to narrow it from its URL — its declared filters, the search
    // and the reserved id set (?ids=…). Absent for any other screen and from older servers.
    listing?: ListingDescriptor

    // A leaf is either a route (the fields above) or a rule (client-side dynamic action). When
    // `rules` is non-empty, clicking the leaf runs them instead of navigating.
    rules: Rule[] | undefined
}
/** One declared filter of a listing, as the URL query param the listing reads. */
export interface ListingFilterDescriptor {
    param: string
    label?: string
    /** text | enum | boolean | number | date | dateTime | dateRange | dateTimeRange | numberRange */
    type: string
    multiple?: boolean
    values?: string[]
    fromParam?: string
    toParam?: string
}

/** How a menu entry's listing can be narrowed from its URL (MenuOptionDto.listing). */
export interface ListingDescriptor {
    idField: string
    idsParam: string
    searchParam?: string | null
    filters: ListingFilterDescriptor[]
}
