package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.getIdField;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;

public abstract class FilteredAutoListOrchestrator<Filters, Row extends Identifiable>
    extends CrudOrchestrator<
        SimpleView<Row>, SimpleView<Row>, SimpleView<Row>, Filters, Row, String> {

  @Override
  public boolean readOnly() {
    return true;
  }

  @Override
  public final String toId(String id) {
    return id;
  }

  @Override
  public Class filtersClass() {
    return getGenericClass(getClass(), FilteredAutoListOrchestrator.class, "Filters");
  }

  @Override
  public Class rowClass() {
    return getGenericClass(getClass(), FilteredAutoListOrchestrator.class, "Row");
  }

  @Override
  public Class viewClass() {
    return rowClass();
  }

  @Override
  public Class editorClass() {
    return rowClass();
  }

  @Override
  public Class creationFormClass() {
    return rowClass();
  }

  @Override
  public final Object search(
      String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
    return doSearch(searchText, (Filters) filters, pageable, httpRequest);
  }

  public abstract ListingData<Row> doSearch(
      String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest);

  @Override
  public abstract Object view(String id, HttpRequest httpRequest);

  @Override
  public final CrudAdapter<SimpleView<Row>, SimpleView<Row>, SimpleView<Row>, Filters, Row, String>
      adapter() {
    return (CrudAdapter) new FilteredAutoListAdapter<>(this);
  }

  @Override
  public Object save(HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only orchestrator");
  }

  @Override
  public Object saveNew(HttpRequest httpRequest) {
    throw new UnsupportedOperationException("Read-only orchestrator");
  }

  @Override
  public String getIdFieldForRow() {
    return getIdField(rowClass());
  }
}
