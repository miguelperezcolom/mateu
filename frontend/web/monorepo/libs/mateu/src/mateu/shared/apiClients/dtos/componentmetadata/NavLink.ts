/**
 * Navigation link rendered as an icon at the right side of a form field. `href` and `title`
 * support `${...}` interpolation against the live component state.
 */
export default interface NavLink {

    href: string
    icon?: string | undefined
    title?: string | undefined
    target?: string | undefined

}
