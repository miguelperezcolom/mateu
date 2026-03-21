package io.mateu.core.infra.declarative;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import lombok.SneakyThrows;

public abstract class AutoCrudAdapter<T extends Identifiable>
    implements CrudAdapter<NamedView<T>, NamedView<T>, NamedView<T>, T, T, String> {

  @Override
  public ListingData<T> search(String searchText, T t, Pageable pageable) {
    return ListingData.of(
        repository().findAll().stream()
            .filter(
                item ->
                    searchText == null
                        || searchText.isEmpty()
                        || (item instanceof Searchable searchable
                                ? searchable.searchableText()
                                : item.toString())
                            .toLowerCase()
                            .contains(searchText.toLowerCase()))
            .toList());
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
