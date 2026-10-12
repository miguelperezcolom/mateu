package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * A page-level floating action button authored as data — the YAML twin of a {@code @Fab} method on
 * a page class. It dispatches {@code actionId} like any button: a page action declared in {@code
 * actions:}, an action-catalogue entry, or the view model's method of that name.
 *
 * @param icon the icon ({@code vaadin:plus})
 * @param label the accessible label / tooltip
 * @param actionId the action it runs
 * @param order the stacking order among the page's FABs (lower first; ties keep declaration order)
 * @param buttonStyle the button style ({@code primary} when absent)
 */
@Builder
@Experimental("YAML page header (3.0 beta)")
public record PageFab(String icon, String label, String actionId, int order, String buttonStyle) {}
