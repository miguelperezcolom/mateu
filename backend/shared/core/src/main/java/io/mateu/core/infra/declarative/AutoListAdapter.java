package io.mateu.core.infra.declarative;

import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.ListAdapter;

public abstract class AutoListAdapter<T extends Identifiable> implements ListAdapter<T, T> {

  @Override
  public ListingData<T> search(String searchText, T filters, Pageable pageable) {
    return ListingData.of(repository().findAll());
  }

  Class<T> entityClass() {
    return getGenericClass(getClass(), AutoCrudAdapter.class, "T");
  }

  public abstract CrudRepository<T> repository();
}
