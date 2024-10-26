package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Caption;

@Caption("")
public class ObjectWrapper {

  @Caption("")
  Object value;

  public Object getValue() {
    return value;
  }

  public ObjectWrapper(Object value) {
    this.value = value;
  }

  public ObjectWrapper() {}
}
