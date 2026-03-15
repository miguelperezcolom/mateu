package io.mateu.core.infra.declarative;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.InstanceFactory;
import io.mateu.uidl.interfaces.ListAdapter;
import io.mateu.uidl.interfaces.ModelSupplier;
import io.mateu.uidl.interfaces.Named;
import io.mateu.uidl.interfaces.NamedView;
import lombok.SneakyThrows;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.List;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

public abstract class AutoListAdapter<T extends Identifiable>
    implements ListAdapter<T, T> {

  @Override
  public ListingData<T> search(String searchText, T filters, Pageable pageable) {
    return ListingData.of(repository().findAll());
  }

  Class<T> entityClass() {
    return getGenericClass(getClass(), AutoCrudAdapter.class, "T");
  }

  public abstract CrudRepository<T> repository();
}
