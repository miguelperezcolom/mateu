package io.mateu.uidl.fluent;

import java.util.Map;

public interface Component {

  default Map<String, String> attributes() {
    return Map.of();
  }

  default Map<String, Object> properties() {
    return Map.of();
  }

  String style();

  String cssClasses();
}
