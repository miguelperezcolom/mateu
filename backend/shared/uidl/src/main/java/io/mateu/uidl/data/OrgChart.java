package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A read-only hierarchy chart (org chart, category tree) of a single {@code root} {@link OrgNode}.
 * Nodes with an {@code actionId} are clickable. Design-system neutral, dark-mode aware.
 *
 * <p>{@code display} picks the presentation (see {@link OrgChartDisplay}): {@code tree} (the
 * default) draws the whole hierarchy top-down, horizontally scrollable when wide; {@code focus}
 * shows one node at a time with its ancestors above and its children below, and {@code focus} is
 * the id of the node it opens on (the root when null or unknown).
 */
@Builder
public record OrgChart(
    String id,
    OrgNode root,
    String style,
    String cssClasses,
    @Experimental("org chart in focus (3.0-beta.38)") OrgChartDisplay display,
    @Experimental("org chart in focus (3.0-beta.38)") String focus)
    implements Component {

  /** The chart before {@code display} and {@code focus} existed (kept for binary compatibility). */
  public OrgChart(String id, OrgNode root, String style, String cssClasses) {
    this(id, root, style, cssClasses, null, null);
  }
}
