import { css } from 'lit'

/**
 * The host rule of the elements an island is drawn in (mateu-component, mateu-api-caller): a block
 * that STRETCHES to its container and may shrink below its content's width.
 *
 * A custom element is `display: inline` by default and these declared no display, so an island (an
 * EmbeddedView, a MicroFrontend) placed in a column whose items align to the start — a
 * vaadin-vertical-layout, a card body — took its CONTENT's width: a `@Zones` form inside one had no
 * room for its columns and stacked them into one. `align-self: stretch` fills the cross axis of a
 * flex parent (the width of a column; in a row, the height a row stretches to anyway), `min-width:
 * 0` lets it shrink inside a row instead of overflowing. A page's own component, a direct child of
 * the (flex column, stretching) mateu-ux, is unchanged.
 */
export const ISLAND_HOST_STYLE = css`
    :host {
        display: block;
        align-self: stretch;
        min-width: 0;
        box-sizing: border-box;
    }
`
