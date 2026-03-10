package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.InstanceFactory;
import io.mateu.uidl.interfaces.SimpleEntity;
import io.mateu.uidl.interfaces.SimpleEntityView;
import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;
import lombok.SneakyThrows;

public abstract class SimpleCrudAdapter<T extends SimpleEntity>
    implements CrudAdapter<
        SimpleEntityView<T>, SimpleEntityView<T>, SimpleEntityView<T>, T, T, String> {

  @Override
  public ListingData<T> search(String searchText, T t, Pageable pageable) {
    return ListingData.of(repository().findAll());
  }

  @Override
  public void deleteAllById(List<String> selectedIds) {
    repository().deleteAllById(selectedIds);
  }

  public SimpleEntityView<T> getView(String id) {
    var entity = repository().findById(id).orElseThrow();
    return new SimpleEntityView<T>() {

      @Override
      public Object state(HttpRequest httpRequest) {
        return entity;
      }

      @Override
      public Collection<Field> allEditableFields() {
        return getAllEditableFields(entityClass());
      }

      @Override
      public String name() {
        return entity.name();
      }

      @Override
      public String create(HttpRequest httpRequest) {
        T entity = toEntity(httpRequest);
        return repository().save(entity);
      }

      @Override
      public void save(HttpRequest httpRequest) {
        T entity = toEntity(httpRequest);
        repository().save(entity);
      }

      @Override
      public String id() {
        return entity.id();
      }
    };
  }

  Class<T> entityClass() {
    return getGenericClass(getClass(), SimpleCrudAdapter.class, "T");
  }

  public SimpleEntityView<T> getEditor(String id) {
    var entity = repository().findById(id).orElseThrow();
    return new SimpleEntityView<T>() {
      @Override
      public Object state(HttpRequest httpRequest) {
        return entity;
      }

      @Override
      public Collection<Field> allEditableFields() {
        return getAllEditableFields(entityClass());
      }

      @Override
      public String name() {
        return entity.name();
      }

      @Override
      public String create(HttpRequest httpRequest) {
        T entity = toEntity(httpRequest);
        return repository().save(entity);
      }

      @Override
      public void save(HttpRequest httpRequest) {
        T entity = toEntity(httpRequest);
        repository().save(entity);
      }

      @Override
      public String id() {
        return entity.id();
      }
    };
  }

  public SimpleEntityView<T> getCreationForm() {
    return new SimpleEntityView<T>() {

      @SneakyThrows
      @Override
      public Object state(HttpRequest httpRequest) {
        return MateuBeanProvider.getBean(InstanceFactory.class)
            .newInstance(entityClass(), httpRequest);
      }

      @Override
      public Collection<Field> allEditableFields() {
        return getAllEditableFields(entityClass());
      }

      @Override
      public String name() {
        return "New";
      }

      @Override
      public String create(HttpRequest httpRequest) {
        T entity = httpRequest.getComponentState(entityClass());
        return repository().save(entity);
      }

      @Override
      public void save(HttpRequest httpRequest) {
        T entity = toEntity(httpRequest);
        repository().save(entity);
      }

      @Override
      public String id() {
        return null;
      }
    };
  }

  public abstract CrudRepository<T> repository();

  @SneakyThrows
  T toEntity(HttpRequest httpRequest) {
    return httpRequest.getComponentState(entityClass());
  }
}
