import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

/**
 * Semantic relationship between the tabbed groups. Carried next to the concrete widget so
 * renderers can adapt the presentation without losing the intent.
 */
export enum GroupRelationship {
    alternative = "alternative",
    sequential = "sequential",
    simultaneous = "simultaneous",
}

export default interface TabLayout extends ComponentMetadata {

    fullWidth: boolean

    orientation: string | undefined
    variant: string | undefined

    /** Semantic relationship between the tabbed groups. */
    groupRelationship?: GroupRelationship

    /**
     * When true the renderer MAY swap the concrete widget (e.g. degrade tabs to an accordion on
     * narrow viewports) as long as the disclosure semantics are preserved.
     */
    adaptable?: boolean
}
