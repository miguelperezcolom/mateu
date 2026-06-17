package io.mateu.uidl.fluent;

import io.mateu.uidl.data.ModelViewComponent;
import java.util.Map;

public interface Component {

  static Component createComponent(Object modelView) {
    if (modelView instanceof Component component) return component;
    return new ModelViewComponent(modelView);
  }

  default Map<String, String> attributes() {
    return Map.of();
  }

  default Map<String, Object> properties() {
    return Map.of();
  }

  default String style() {
    return "";
  }

  default String cssClasses() {
    return "";
  }

  default String containerId() {
    return null;
  }
}
