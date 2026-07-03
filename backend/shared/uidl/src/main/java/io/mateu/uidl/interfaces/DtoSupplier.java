package io.mateu.uidl.interfaces;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.fluent.Component;

/**
 * A {@link ComponentTreeSupplier} variant that produces a fully-built wire {@link ComponentDto}
 * directly via {@link #dto(HttpRequest)}, bypassing the fluent {@link Component} mapping (its
 * {@link #component(HttpRequest)} throws). Use it when you want complete control over the emitted
 * DTO.
 */
public interface DtoSupplier extends ComponentTreeSupplier {

  ComponentDto dto(HttpRequest httpRequest);

  default Component component(HttpRequest httpRequest) {
    throw new UnsupportedOperationException(
        "component() method should not be called on DtoSupplier");
  }
}
