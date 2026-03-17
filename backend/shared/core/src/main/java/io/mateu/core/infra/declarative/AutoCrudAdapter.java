package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.declarative.CrudAdapterHelper.toEntity;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import lombok.SneakyThrows;

class AutoNamedView<T extends Identifiable> implements NamedView<T>, ModelSupplier {

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
    repository.save(entity);
  }

  @Override
  public String id() {
    return entity.id();
  }

  @SneakyThrows
  T toEntity(HttpRequest httpRequest) {
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
}

public abstract class AutoCrudAdapter<T extends Identifiable>
    implements CrudAdapter<NamedView<T>, NamedView<T>, NamedView<T>, T, T, String> {

  @Override
  public ListingData<T> search(String searchText, T t, Pageable pageable) {
    return ListingData.of(repository().findAll());
  }

  @Override
  public void deleteAllById(List<String> selectedIds) {
    repository().deleteAllById(selectedIds);
  }

  public NamedView<T> getView(String id) {
    var entity = repository().findById(id).orElseThrow();
    return new AutoNamedView<>(entityClass(), entity, repository());
  }

  Class<T> entityClass() {
    return getGenericClass(getClass(), AutoCrudAdapter.class, "T");
  }

  public NamedView<T> getEditor(String id) {
    var entity = repository().findById(id).orElseThrow();
    return new AutoNamedView<>(entityClass(), entity, repository());
  }

  @SneakyThrows
  public NamedView<T> getCreationForm(HttpRequest httpRequest) {
    var instance =
        MateuBeanProvider.getBean(InstanceFactory.class).newInstance(entityClass(), httpRequest);
    return new AutoNamedView<>(entityClass(), instance, repository());
  }

  public abstract CrudRepository<T> repository();

  @SneakyThrows
  T toEntity(HttpRequest httpRequest) {
    return httpRequest.getComponentState(entityClass());
  }
}
