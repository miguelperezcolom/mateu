package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.Map;
import lombok.Builder;

@Builder
public record Element(
    String name,
    Map<String, String> attributes,
    Map<String, String> on,
    String content,
    String style,
    String cssClasses)
    implements Component {

  public Element(String name, Map<String, String> attributes, String content) {
    this(name, attributes, Map.of(), content, "", "");
  }
}
