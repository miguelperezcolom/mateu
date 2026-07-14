package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * One node of an {@link OrgChart}: a title, optional subtitle, avatar (emoji or image URL) and
 * accent color, plus its {@code children}. An {@code actionId} makes the node clickable.
 */
@Builder
public record OrgNode(
    String id,
    String title,
    String subtitle,
    String avatar,
    String color,
    String actionId,
    List<OrgNode> children) {}
