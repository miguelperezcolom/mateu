package io.mateu.core.domain.uidefinition.core.interfaces;

public interface ReadOnlyPojo<Id> {

  default boolean hasEditor() {
    return false;
  }

  default Object retrieveEditor() throws Throwable {
    return null;
  }

  void load(Id id) throws Throwable;

  Object retrieveId();
}
