package io.mateu.uidl.interfaces;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.fluent.Component;

public interface DtoSupplier extends ComponentTreeSupplier {

  ComponentDto dto(HttpRequest httpRequest);

  default Component component(HttpRequest httpRequest) {
    throw new UnsupportedOperationException(
        "component() method should not be called on DtoSupplier");
  }
}
