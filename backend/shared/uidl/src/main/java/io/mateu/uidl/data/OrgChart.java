package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A read-only top-down hierarchy chart (org chart, category tree): a single {@code root} {@link
 * OrgNode} whose children fan out below it, connected by lines. Nodes with an {@code actionId} are
 * clickable. Design-system neutral, dark-mode aware, horizontally scrollable when wide.
 */
@Builder
public record OrgChart(String id, OrgNode root, String style, String cssClasses)
    implements Component {}
