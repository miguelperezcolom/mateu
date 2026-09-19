/**
 * One responsive grid — THE general layout foundation (coherence-plan #9). The tracks (sized with
 * the #8 hug/fixed/fill vocabulary) arrive resolved as a CSS grid-template-columns string; children
 * travel as the component's children.
 */
export default interface ResponsiveGrid {
    gridTemplateColumns?: string | undefined
    gap?: string | undefined
}
