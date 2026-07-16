import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Notice extends ComponentMetadata {
    text?: string
    /** info | success | warning | danger (default info) */
    theme?: string
    /** overrides the theme's default severity glyph */
    icon?: string
    /** suppresses the severity icon entirely */
    noIcon?: boolean
    actionLabel?: string
    actionId?: string
    /** right-aligned state text rendered where the action button goes */
    status?: string
    /** tight variant: no block margins and reduced padding */
    slim?: boolean
    /** spans the full form width (all columns) */
    fullWidth?: boolean
}
