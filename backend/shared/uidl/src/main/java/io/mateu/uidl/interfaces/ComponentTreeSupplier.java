package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.fluent.Component;

public interface ComponentTreeSupplier extends Component {

  default String id() {
    return this.getClass().getName();
  }

  Component component(HttpRequest httpRequest);

  default String style() {
      if (getClass().isAnnotationPresent(Style.class)) {
          return getClass().getAnnotation(Style.class).value();
      }
    return "max-width:900px;margin: auto;";
  }

  default String cssClasses() {
    return null;
  }
}
