package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;

public interface ComponentTreeSupplier {

  default String id() {
    return this.getClass().getName();
  }

  Component getComponent(HttpRequest httpRequest);

  default String style() {
    return null;
  }

  default String cssClasses() {
    return null;
  }
}
