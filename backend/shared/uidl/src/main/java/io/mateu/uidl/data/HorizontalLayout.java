package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record HorizontalLayout(
    String id,
    List<Component> content,
    boolean spacing,
    boolean padding,
    boolean margin,
    SpacingVariant spacingVariant,
    HorizontalLayoutVerticalAlignment verticalAlignment,
    HorizontalLayoutJustification justification,
    boolean wrap,
    List<Integer> flexGrows,
    boolean fullWidth,
    String style,
    String cssClasses)
    implements Component {

  public HorizontalLayout(List<Component> content) {
    this(null, content, false, false, false, null, null, null, false, List.of(), false, null, null);
  }
}
