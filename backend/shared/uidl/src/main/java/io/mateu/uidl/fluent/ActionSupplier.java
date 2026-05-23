package io.mateu.uidl.fluent;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

public interface ActionSupplier {

  default List<Action> actions(HttpRequest httpRequest) {
    return List.of(Action.builder().id("*").build());
  }
}
