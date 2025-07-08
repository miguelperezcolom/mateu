package io.mateu.uidl.interfaces;

import io.mateu.uidl.fluent.Component;
import reactor.core.publisher.Mono;

public interface ReactiveComponentTreeSupplier {

  default String id() {
    return this.getClass().getName();
  }

  Mono<Component> getComponent(HttpRequest httpRequest);

  default String style() {
    return null;
  }

  default String cssClasses() {
    return null;
  }
}
