package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import io.mateu.uidl.interfaces.Identifiable;

public record FakeEntity(String id, String name) implements Identifiable {
  @Override
  public String toString() {
    return name;
  }
}
