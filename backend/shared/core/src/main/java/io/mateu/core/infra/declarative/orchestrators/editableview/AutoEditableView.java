package io.mateu.core.infra.declarative.orchestrators.editableview;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.interfaces.HttpRequest;

public abstract class AutoEditableView<T> extends EditableView<T, T> {

  @Override
  public T view(HttpRequest httpRequest) {
    return load(httpRequest);
  }

  @Override
  public T editor(HttpRequest httpRequest) {
    return load(httpRequest);
  }

  @Override
  public void save(HttpRequest httpRequest) {
    // The editor form bubbles its own state up to this mediator in the action event, so read the
    // edited entity from there (falls back to component state when not embedded/bubbled).
    var entity = httpRequest.getInitiatorState(entityClass());
    persist(entity, httpRequest);
  }

  public abstract T load(HttpRequest httpRequest);

  public abstract void persist(T entity, HttpRequest httpRequest);

  Class<T> entityClass() {
    return getGenericClass(getClass(), AutoEditableView.class, "T");
  }
}
