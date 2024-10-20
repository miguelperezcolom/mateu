package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/** Metadata for a html element */
public record Element(String name, Map<String, Object> attributes, String content)
    implements ComponentMetadata {

  public Element {
    attributes = attributes != null ? Collections.unmodifiableMap(attributes) : Map.of();
  }

  @Override
  public Map<String, Object> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}
