package io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;

@Title("")
public class ObjectWrapper {

  @Label("")
  Object value;

  public Object getValue() {
    return value;
  }

  public ObjectWrapper(Object value) {
    this.value = value;
  }

  public ObjectWrapper() {}
}
