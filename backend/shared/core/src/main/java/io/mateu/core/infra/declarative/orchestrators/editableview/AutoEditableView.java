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
    // Only what the editor let the user write comes from there: the id, the read-only fields and
    // the ones hidden or locked for the caller keep the values load() answers (GA review — the
    // entity used to be the posted state as it came, the hole closed for cruds left open here).
    var entity = editedEntity(httpRequest);
    // the editor advertises save as validationRequired: re-check on the server the constraints the
    // client was told to check (a crafted or non-validating client reached persist with any value)
    io.mateu.core.domain.out.fragmentmapper.mappers.ServerConstraintCheck.enforce(
        entity, httpRequest, false);
    persist(entity, httpRequest);
  }

  @SuppressWarnings("unchecked")
  private T editedEntity(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var posted =
        parameters != null && parameters.get("initiatorState") instanceof java.util.Map<?, ?> m
            ? (java.util.Map<String, Object>) m
            : httpRequest.runActionRq().componentState();
    var loaded = load(httpRequest);
    return io.mateu.core.infra.declarative.orchestrators.crud.ClientWritableFields.entityFor(
        entityClass(),
        posted,
        loaded,
        io.mateu.core.infra.declarative.orchestrators.crud.ClientWritableFields.declaredIdOf(
            entityClass()),
        loaded == null,
        httpRequest);
  }

  public abstract T load(HttpRequest httpRequest);

  public abstract void persist(T entity, HttpRequest httpRequest);

  Class<T> entityClass() {
    return getGenericClass(getClass(), AutoEditableView.class, "T");
  }
}
