package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A responsive form grid: its {@code content} (fields, rows) flows into up to {@code maxColumns}
 * columns, with labels on top or, with {@code labelsAside}, to the left of each field. The fluent
 * counterpart of the {@code @FormLayout} annotation.
 */
@Builder(toBuilder = true)
public record FormLayout(
    String id,
    List<Component> content,
    boolean autoResponsive,
    boolean labelsAside,
    int maxColumns,
    String columnWidth,
    boolean expandColumns,
    boolean expandFields,
    Object responsiveSteps,
    String itemLabelWidth,
    String columnSpacing,
    String itemRowSpacing,
    String itemLabelSpacing,
    String style,
    String cssClasses)
    implements Component {}
