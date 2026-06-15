package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.getIdField;

import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;

public abstract class FilteredAutoListOrchestrator<Filters, T extends Identifiable>
    extends CrudOrchestrator<SimpleView<T>, SimpleView<T>, SimpleView<T>, Filters, T, String> {

  @Override
  public boolean readOnly() {
    return true;
  }

  @Override
  public String toId(String id) {
    return id;
  }

  @Override
  public CrudAdapter<SimpleView<T>, SimpleView<T>, SimpleView<T>, Filters, T, String> adapter() {
    return (CrudAdapter) simpleAdapter();
  }

  public abstract AutoListAdapter<T> simpleAdapter();

  public Class filtersClass() {
    return entityClass();
  }

  public Class rowClass() {
    return entityClass();
  }

  public Class viewClass() {
    return entityClass();
  }

  @Override
  public Class editorClass() {
    return entityClass();
  }

  @Override
  public Class creationFormClass() {
    return entityClass();
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
    return getIdField(entityClass());
  }

  @Override
  public Object search(
      String searchText, Object filters, Pageable pageable, HttpRequest httpRequest) {
    return adapter().search(searchText, (Filters) filters, pageable, httpRequest);
  }
}
