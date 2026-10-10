package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * One lateral panel of a {@link FoldoutLayout}: a category of information associated to the record
 * shown in the overview. Closed panels render as a narrow strip with the rotated title; clicking
 * folds them out. {@code open} controls the initial state. {@code width} is an optional CSS length
 * (e.g. {@code "40rem"}) for the expanded panel — null keeps the renderer's default section width,
 * so panels can size to their content (a wide checklist, a narrow property list).
 */
@Builder
public record FoldoutPanel(
    String id,
    String title,
    String subtitle,
    String icon,
    boolean open,
    String width,
    Component content,
    /**
     * What the panel shows while it is FOLDED (the Redwood foldout-panel {@code summary} slot): a
     * compact digest — a count, a status, a total — drawn in the collapsed strip under the rotated
     * title, so the user can tell whether it is worth opening. Null = title only.
     */
    Component summary,
    String style,
    String cssClasses)
    implements Component {}
