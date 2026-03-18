package io.mateu.uidl.data;

import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.HttpRequest;

public record NoCreationForm<T>() implements CrudCreationForm<T> {
  @Override
  public T create(HttpRequest httpRequest) {
    throw new UnsupportedOperationException();
  }
}
