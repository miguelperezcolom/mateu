package io.mateu.uidl.data;

import java.util.Collections;
import java.util.Map;

public record Iframe(String url, Map<String, Object> attributes) {

  public Iframe(String url) {
    this(url, Map.of());
  }

  public Iframe {
    attributes = attributes != null ? Collections.unmodifiableMap(attributes) : Map.of();
  }

  @Override
  public Map<String, Object> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}
