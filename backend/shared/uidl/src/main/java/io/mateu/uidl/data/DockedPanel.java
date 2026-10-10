package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A panel docked beside or under a page's main content (the Redwood data-management {@code
 * innerEnd}/{@code innerBottom} slots): it REFLOWS the content — the main area shrinks to make room
 * — rather than overlaying it, so the user works with both at once (a details pane next to the
 * grid, a messages/log strip under it). Supplied by the {@code DataManagement} archetype's {@code
 * endPanel(...)} / {@code bottomPanel(...)} hooks; the page draws a toggle for each one and keeps
 * whether it is open in its state.
 *
 * @param id stable id (also the toggle's id)
 * @param title the panel's heading and the toggle's label
 * @param content what the panel shows
 * @param size the panel's width (end) or height (bottom) as a CSS length; null = 22rem / 16rem
 * @param open whether it starts open
 */
@Builder
public record DockedPanel(String id, String title, Component content, String size, boolean open) {}
