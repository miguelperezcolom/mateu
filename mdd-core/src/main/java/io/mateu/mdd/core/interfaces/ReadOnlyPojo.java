package io.mateu.mdd.core.interfaces;

import io.mateu.util.Helper;

public interface ReadOnlyPojo<Id> {

  default boolean hasEditor() {
    return false;
  }

  default Object retrieveEditor() throws Throwable {
    return null;
  }

  default String retrieveEntityName() {
    return Helper.capitalize(getClass().getSimpleName());
  }

  void load(Id id) throws Throwable;

  Object retrieveId();
}
