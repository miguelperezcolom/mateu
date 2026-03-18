package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;

public record NoEditor<T>() implements CrudEditorForm<T> {
  @Override
  public void save(HttpRequest httpRequest) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T id() {
    return null;
  }
}
