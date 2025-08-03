package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
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
