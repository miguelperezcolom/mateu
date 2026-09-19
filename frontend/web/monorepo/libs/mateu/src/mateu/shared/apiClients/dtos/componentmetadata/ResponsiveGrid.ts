/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). The tracks (sized with
 * the #8 hug/fixed/fill vocabulary) arrive resolved as a CSS grid-template-columns string; children
 * travel as the component's children.
 */
export default interface ResponsiveGrid {
    gridTemplateColumns?: string | undefined
    gap?: string | undefined
    /** Optional per-child column span, aligned with the children; a child with span N occupies N
     *  tracks (a full-width band uses a large span). */
    colSpans?: number[] | undefined
    /** Responsive breakpoint: a CSS length below which the grid (its container) collapses to one
     *  column. Absent = never collapse. */
    stackBelow?: string | undefined
    /** Named-slot template (coherence-plan #7): a CSS grid-template-areas value; a child whose slot
     *  matches an area name is placed there. Absent = children flow into the column tracks. */
    gridTemplateAreas?: string | undefined
    /** Named areas pinned with position:sticky while the rest of the grid scrolls (coherence-plan
     *  #7): a child whose slot is listed here gets a sticky wrapper. Absent/empty = none. */
    stickyAreas?: string[] | undefined
}
