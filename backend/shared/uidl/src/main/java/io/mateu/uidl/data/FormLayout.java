package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record FormLayout(
    String id,
    List<Component> content,
    int columns,
    LabelPosition labelPosition,
    SpacingVariant columnSpacing,
    SpacingVariant itemRowSpacing,
    SpacingVariant itemLabelSpacing,
    String style,
    String cssClasses)
    implements Component {}
