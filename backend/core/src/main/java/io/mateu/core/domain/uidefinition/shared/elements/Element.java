package io.mateu.core.domain.uidefinition.shared.elements;

import java.util.Collections;
import java.util.Map;

public record Element(String name, String content, Map<String, String> attributes) {

  public Element(String name, String content) {
    this(name, content, Map.of());
  }

  public Element {
    attributes = attributes != null ? Collections.unmodifiableMap(attributes) : Map.of();
  }

  @Override
  public Map<String, String> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}