import { css } from 'lit'

/**
 * Focus ring for elements made keyboard-operable by hand.
 *
 * A native control draws its own focus ring; a `<div role="button" tabindex="0">` draws nothing.
 * Without this the element is reachable but the user cannot see where they are, which in practice
 * is barely better than not being reachable at all — they Tab into a void and have to guess.
 *
 * `:focus-visible` rather than `:focus`, so the ring appears for keyboard use and not around
 * everything a mouse touches. Interpolated into each component's own `static styles`, because
 * shadow DOM means a document-level rule would never reach these elements.
 *
 * Lives apart from {@link ./activate} so that module stays free of any `lit` import and can be
 * unit-tested as pure logic.
 */
export const activatableFocusStyles = css`
    [role="button"]:focus-visible,
    [role="option"]:focus-visible,
    [role="treeitem"]:focus-visible,
    [role="tab"]:focus-visible,
    [role="gridcell"]:focus-visible,
    [tabindex="0"]:focus-visible {
        outline: 2px solid var(--lumo-primary-color, #3b5bdb);
        outline-offset: 2px;
        border-radius: var(--lumo-border-radius-s, 4px);
    }
`
