package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.declarative.orchestrators.crud.CrudAdapterHelper.getIdField;

import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;

public abstract class FilteredAutoCrud<Filters, T extends Identifiable>
    extends Crud<SimpleView<T>, SimpleView<T>, SimpleView<T>, Filters, T, String> {

  @Override
  public String toId(String id) {
    return id;
  }

  @Override
  public CrudAdapter<SimpleView<T>, SimpleView<T>, Filters, T, String> adapter() {
    return (CrudAdapter) simpleAdapter();
  }

  public abstract AutoCrudAdapter<T> simpleAdapter();

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
    var entity = simpleAdapter().toEntity(httpRequest);
    simpleAdapter().getEditor(entity.id(), httpRequest).save(httpRequest);
    return entity.id();
  }

  @Override
  public Object saveNew(HttpRequest httpRequest) {
    return simpleAdapter().getCreationForm(httpRequest).create(httpRequest);
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
