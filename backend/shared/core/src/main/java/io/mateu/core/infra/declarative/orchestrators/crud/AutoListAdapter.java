package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.*;
import java.util.List;

public abstract class AutoListAdapter<T extends Identifiable>
    implements CrudAdapter<NamedView<T>, NamedView<T>, T, T, String> {

  @Override
  public ListingData<T> search(String searchText, T t, Pageable pageable, HttpRequest httpRequest) {
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
  public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only adapter");
  }

  @Override
  public Object getView(String id, HttpRequest httpRequest) {
    var entity = repository().findById(id).orElseThrow();
    return new AutoNamedView<>(entityClass(), entity, null);
  }

  @Override
  public Object getEditor(String id, HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only adapter");
  }

  @Override
  public Object getCreationForm(HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only adapter");
  }

  Class<T> entityClass() {
    return getGenericClass(getClass(), AutoListAdapter.class, "T");
  }

  public abstract CrudRepository<T> repository();
}
