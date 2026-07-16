/** An action button on the app header, next to the app-context selectors. */
export default interface AppHeaderAction {
    actionId: string | undefined
    label: string
    icon: string | undefined
    /** Present: the action renders as a dropdown menu and only these dispatch. */
    children: AppHeaderAction[] | undefined
}
