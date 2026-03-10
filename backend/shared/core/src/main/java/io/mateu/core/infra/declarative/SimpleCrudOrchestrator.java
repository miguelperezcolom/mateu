package io.mateu.core.infra.declarative;

import static io.mateu.core.infra.declarative.CrudAdapterHelper.getIdField;

import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.SimpleEntity;

public abstract class SimpleCrudOrchestrator<T extends SimpleEntity>
    extends CrudOrchestrator<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String> {

  @Override
  public String toId(String id) {
    return id;
  }

  @Override
  public CrudAdapter<SimpleView<T>, SimpleView<T>, SimpleView<T>, T, T, String> adapter() {
    return (CrudAdapter) simpleAdapter();
  }

  public abstract SimpleCrudAdapter<T> simpleAdapter();

  public Class filtersClass() {
    return entityClass();
  }

  public Class rowClass() {
    return entityClass();
  }

  public Class viewClass() {
    return SimpleView.class;
  }

  @Override
  public Class editorClass() {
    return SimpleView.class;
  }

  @Override
  public Class creationFormClass() {
    return SimpleView.class;
  }

  @Override
  public Object save(HttpRequest httpRequest) {
    var entity = simpleAdapter().toEntity(httpRequest);
    simpleAdapter().getEditor(entity.id()).save(httpRequest);
    return entity.id();
  }

  @Override
  public Object saveNew(HttpRequest httpRequest) {
    return simpleAdapter().getCreationForm().create(httpRequest);
  }

  @Override
  public String getIdFieldForRow() {
    return getIdField(entityClass());
  }
}
