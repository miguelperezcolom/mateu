package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;

public interface ComponentTreeSupplier extends Component {

  default String id() {
    return this.getClass().getName();
  }

  Component component(HttpRequest httpRequest);

  default String style() {
    return null;
  }

  default String cssClasses() {
    return null;
  }
}
