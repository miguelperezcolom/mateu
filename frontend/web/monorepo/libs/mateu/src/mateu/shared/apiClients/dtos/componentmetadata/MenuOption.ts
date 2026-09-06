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

    path: string

    baseUrl: string
    route: string
    consumedRoute: string
    serverSideType: string | undefined
    params: Record<string, unknown>
    explode: boolean
    uriPrefix: string | undefined
    description: string | undefined

    // A leaf is either a route (the fields above) or a rule (client-side dynamic action). When
    // `rules` is non-empty, clicking the leaf runs them instead of navigating.
    rules: Rule[] | undefined
}