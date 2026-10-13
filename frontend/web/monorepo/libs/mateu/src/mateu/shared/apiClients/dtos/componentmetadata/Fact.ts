export default interface Fact {
    label?: string
    value?: string
    /** The action of the icon-only button drawn after the value; absent = display-only fact. */
    actionId?: string
    /** The button's icon (a `vaadin:*` token; the server defaults it to a pencil). */
    icon?: string
    /** The button's accessible name and tooltip; the fact's label when absent. */
    actionLabel?: string
    /** Sent with the action, like a Button's parameters. */
    parameters?: Record<string, unknown>
}
