package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import java.util.List;
import lombok.Builder;

/**
 * Lays its {@code content} out side by side, with optional spacing, alignment and wrapping ({@code
 * wrap} lets a child drop below the others on a narrow screen; {@code flexGrows} gives each child
 * its share of the width).
 */
@Builder
public record HorizontalLayout(
    String id,
    List<Component> content,
    boolean spacing,
    boolean padding,
    boolean margin,
    SpacingVariant spacingVariant,
    VerticalAlignment verticalAlignment,
    HorizontalLayoutJustification justification,
    boolean wrap,
    List<Integer> flexGrows,
    boolean fullWidth,
    String style,
    String cssClasses)
    implements Component, ContentSupplier {

  public HorizontalLayout(List<Component> content) {
    this(null, content, false, false, false, null, null, null, false, List.of(), false, null, null);
  }

  public HorizontalLayout(Component... components) {
    this(
        null,
        List.of(components),
        false,
        false,
        false,
        null,
        null,
        null,
        false,
        List.of(),
        false,
        null,
        null);
  }
}
