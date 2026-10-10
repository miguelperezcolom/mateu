package io.mateu.uidl.data;

/**
 * The payload of an {@code Announce} command: a text for assistive technology, read through the
 * page's polite live region, or the assertive one when {@code assertive} (interrupting — keep it
 * for errors). Built with {@link UICommand#announce(String)} / {@link
 * UICommand#announceAssertive(String)}.
 */
public record Announcement(String text, boolean assertive) {}
