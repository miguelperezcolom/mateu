package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.Map;
import lombok.Builder;

/**
 * A horizontal divider line ({@code <hr>}) separating contents inside a section, form or any
 * layout. Declaratively, annotate a field with {@code @SeparatorBefore} to paint one above it.
 */
@Builder
public record Separator(String id, Map<String, String> attributes, String style, String cssClasses)
    implements Component {

  public Separator() {
    this(null, Map.of(), "", "");
  }

  @Override
  public Map<String, String> attributes() {
    return attributes != null ? attributes : Map.of();
  }
}
