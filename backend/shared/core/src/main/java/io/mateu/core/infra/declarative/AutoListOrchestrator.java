package io.mateu.core.infra.declarative;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;

public abstract class AutoListOrchestrator<T extends Identifiable> extends AutoCrudOrchestrator<T> {

  @Override
  public CrudAdapter<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String> adapter() {
    return new CrudAdapter<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String>() {
      @Override
      public ListingData<T> search(
          String searchText, T t, Pageable pageable, HttpRequest httpRequest) {
        return simpleListAdapter().search(searchText, t, pageable);
      }

      @Override
      public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
        throw new UnsupportedOperationException();
      }

      @Override
      public SimpleView<T> getView(String id, HttpRequest httpRequest) {
        throw new UnsupportedOperationException();
      }

      @Override
      public SimpleView<T> getEditor(String id, HttpRequest httpRequest) {
        throw new UnsupportedOperationException();
      }

      @Override
      public SimpleView<T> getCreationForm(HttpRequest httpRequest) {
        throw new UnsupportedOperationException();
      }
    };
  }

  @Override
  public AutoCrudAdapter<T> simpleAdapter() {
    throw new UnsupportedOperationException();
  }

  public abstract AutoListAdapter<T> simpleListAdapter();

  @Override
  public String title() {
    return "";
  }

  @Override
  public boolean searchable() {
    return false;
  }

  @Override
  public boolean selectionEnabled() {
    return false;
  }
}
