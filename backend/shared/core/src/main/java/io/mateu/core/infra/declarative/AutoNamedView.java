package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;

import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.Map;
import lombok.SneakyThrows;

public class AutoNamedView<T extends Identifiable>
    implements Named,
        CrudEditorForm<String>,
        CrudCreationForm<String>,
        EditableFieldsProvider,
        StateSupplier,
        ModelSupplier {

  T entity;
  Class<T> entityClass;
  CrudRepository<T> repository;

  public AutoNamedView(Class<T> entityClass, T entity, CrudRepository<T> repository) {
    this.entityClass = entityClass;
    this.entity = entity;
    this.repository = repository;
  }

  @Override
  public Object state(HttpRequest httpRequest) {
    return entity;
  }

  @Override
  public Collection<Field> allEditableFields() {
    return getAllEditableFields(entityClass);
  }

  @Override
  public String create(HttpRequest httpRequest) {
    T entity = (T) toEntity(httpRequest);
    return repository.save(entity);
  }

  @Override
  public void save(HttpRequest httpRequest) {
    T entity = (T) toEntity(httpRequest);
    // optimistic locking (@Version field): reject the save when someone else saved in between,
    // bump the version otherwise — both no-ops for entities without a version field
    io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.check(
        entity, repository.findById(entity.id()), httpRequest);
    io.mateu.core.infra.declarative.orchestrators.crud.OptimisticLock.bump(entity);
    repository.save(entity);
  }

  @Override
  public String id() {
    return entity.id();
  }

  @SneakyThrows
  T toEntity(HttpRequest httpRequest) {
    Map<String, Object> data = Map.of();
    if (httpRequest.runActionRq().parameters() != null) {
      if (httpRequest.runActionRq().parameters().containsKey("initiatorState")) {
        data = (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
        var instance =
            MateuBeanProvider.getBean(InstanceFactory.class)
                .newInstance(entityClass(), data, httpRequest);
        return (T) instance;
      }
    }
    return httpRequest.getComponentState(entityClass);
  }

  @Override
  public Object model() {
    return entity;
  }

  @Override
  public String name() {
    if (entity instanceof Named named) {
      return named.name();
    }
    return entity.toString();
  }

  public Class<T> entityClass() {
    return entityClass;
  }

  public T entity() {
    return entity;
  }
}
