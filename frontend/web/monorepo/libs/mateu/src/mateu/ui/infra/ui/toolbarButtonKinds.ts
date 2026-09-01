/**
 * What kind of toolbar button an action id names.
 *
 * <p>Its own module, and three predicates rather than one, because the header and the crud each
 * used to carry a private copy of a single `isNavButton` — the same ids spelled out twice with
 * nothing keeping them in step. Splitting that one predicate into two while there were two copies
 * of it would have been the easiest possible way to make the two renderers disagree.
 *
 * <p>Back and cancel are grouped together for LAYOUT — both sit apart from a page's real actions —
 * but they are not the same gesture, and the header renders them differently: back leaves a page
 * for the one it came from, and reads as a chevron before its title, the way a detail view has read
 * since phones had one. Cancel abandons an edit in progress; it is a decision, it belongs beside
 * the Save it is the alternative to, and as a glyph it would be hidden exactly where it needs to
 * be read.
 *
 * <p><b>The distinction is not the `cancel` prefix.</b> A crud's "Back to list" is
 * {@code cancel-view} (ViewToolbarBuilder) and its creation form's Cancel is {@code cancel-new},
 * so a prefix rule puts the way out and the abandon-this-edit under the same roof. The server
 * already draws the line where it matters — CancelToListActionHandler answers {@code cancel-view}
 * and {@code cancel-new}, both of which land on the list — and the split here follows the gesture
 * rather than the handler: leaving a record you were only LOOKING at is navigation, while
 * abandoning a form you were filling in, new or not, is a decision.
 */

/**
 * Leaves the current page for the one it came from, with nothing to abandon. Rendered as a chevron
 * before the title.
 */
export const isBackButton = (id: string | undefined): boolean =>
    id === 'back' || id === 'backToList' || id === 'cancel-view'

/**
 * Abandons an edit — of an existing record ({@code cancel-edit}) or of one being created
 * ({@code cancel-new}). Stays an ordinary button, beside Save.
 */
export const isCancelButton = (id: string | undefined): boolean =>
    !!id && id.startsWith('cancel') && !isBackButton(id)

/** Either of the two: the buttons that sit apart from a page's real actions. */
export const isNavButton = (id: string | undefined): boolean =>
    isBackButton(id) || isCancelButton(id)
