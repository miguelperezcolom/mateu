package io.mateu.core.infra.declarative.orchestrators.crudorchestrator;

import static io.mateu.core.infra.declarative.orchestrators.crudorchestrator.CrudAdapterHelper.getIdField;

import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;

public abstract class AutoCrudOrchestrator<T extends Identifiable>
    extends CrudOrchestrator<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String> {

  @Override
  public String toId(String id) {
    return id;
  }

  @Override
  public CrudAdapter<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String> adapter() {
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
}
