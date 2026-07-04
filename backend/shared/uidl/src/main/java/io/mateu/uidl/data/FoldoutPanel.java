package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * One lateral panel of a {@link FoldoutLayout}: a category of information associated to the record
 * shown in the overview. Closed panels render as a narrow strip with the rotated title; clicking
 * folds them out. {@code open} controls the initial state.
 */
@Builder
public record FoldoutPanel(
    String id,
    String title,
    String subtitle,
    String icon,
    boolean open,
    Component content,
    String style,
    String cssClasses)
    implements Component {}
