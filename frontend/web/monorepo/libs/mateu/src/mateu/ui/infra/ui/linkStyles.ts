import { css } from 'lit'

/**
 * The colour of a bare link (`<a href>`) drawn inside a Mateu shadow root.
 *
 * A document-level `a { color }` rule (Lumo's, or the page's) does not cross a shadow boundary, so
 * a link that arrives as raw HTML — a `Text` widget, a header widget written as an HTML string —
 * fell back to the browser's own link blue (#0000EE, lavender in dark). This puts it back on the
 * theme: `--lumo-primary-text-color`, which follows the dark theme too.
 *
 * `--mateu-link-color` lets a zone recolour the links it hosts without knowing where they are
 * drawn: custom properties inherit through shadow roots, so the app header sets it on its widget
 * zone and a raw link in a header widget reads as header text, not as a content link.
 *
 * `:where()` keeps the rule at zero specificity: any class, inline style or component rule of the
 * link itself still wins.
 */
export const linkStyles = css`
    :where(a:any-link) {
        color: var(--mateu-link-color, var(--lumo-primary-text-color, #1676f3));
    }
`
