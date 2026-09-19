import { html, TemplateResult } from "lit";

/**
 * The shared CSS-grid primitive (coherence-plan #9). Both the general ResponsiveGrid and the
 * form-specialized FormLayout are responsive CSS grids that place children in cells and let a child
 * span N tracks — this is the ONE implementation of that cell, so "the one grid" is literally one
 * code path for spanning, not two copies. FormLayout adds its form semantics (labels, rows,
 * auto-fill track sizing) on top; it does not fork the primitive.
 *
 * A spanning cell rides in a `grid-column: span N` div; `min-width: 0` lets a wide child (a table)
 * shrink instead of blowing the track out. `alwaysWrap` keeps the wrapper even for a single-track
 * cell — the form uses it so EVERY field gets the min-width:0 cell; the general grid omits the
 * wrapper for a single-span child so a child that brings its own cell placement is untouched.
 */
export const gridCell = (
    colspan: number | undefined,
    content: TemplateResult,
    alwaysWrap = false,
): TemplateResult =>
    (colspan && colspan > 1) || alwaysWrap
        ? html`<div style="grid-column: span ${colspan && colspan > 1 ? colspan : 1}; min-width: 0;">${content}</div>`
        : content
