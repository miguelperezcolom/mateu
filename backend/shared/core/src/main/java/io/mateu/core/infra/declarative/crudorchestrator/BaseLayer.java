package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.declarative.AutoNamedView;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.core.infra.declarative.SimpleView;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;

public abstract class BaseLayer<
    View,
    Editor extends CrudEditorForm<IdType>,
    CreationForm extends CrudCreationForm<IdType>,
    Filters,
    Row,
    IdType> {

  public Class<?> viewModelClass() {
    if ("edit".equals(state())) {
      var type = editorClass();
      if (AutoNamedView.class.isAssignableFrom(type) || SimpleView.class.isAssignableFrom(type)) {
        return entityClass();
      }
      return type;
    }
    if ("create".equals(state())) {
      var type = creationFormClass();
      if (AutoNamedView.class.isAssignableFrom(type) || SimpleView.class.isAssignableFrom(type)) {
        return entityClass();
      }
      return type;
    }
    if ("view".equals(state())) {
      var type = viewClass();
      if (AutoNamedView.class.isAssignableFrom(type)) {
        return entityClass();
      }
      return type;
    }
    return entityClass();
  }

  public Class<?> entityClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "EntityType");
  }

  public Class<Filters> filtersClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Filters");
  }

  public Class<Row> rowClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Row");
  }

  public Class<View> viewClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "View");
  }

  public Class<Editor> editorClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "Editor");
  }

  public Class<CreationForm> creationFormClass() {
    return getGenericClass(this.getClass(), CrudOrchestrator.class, "CreationForm");
  }

  public boolean readOnly() {
    if (getClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    if (viewClass().isAnnotationPresent(ReadOnly.class)) {
      return true;
    }
    return false;
  }

  public abstract CrudAdapter<View, Editor, CreationForm, Filters, Row, IdType> adapter();

  public abstract Object create(HttpRequest httpRequest);

  public abstract Object edit(IdType id, HttpRequest httpRequest);

  public abstract Object view(IdType id, HttpRequest httpRequest);

  public abstract IdType toId(String s);

  public boolean selectionEnabled() {
    return true;
  }

  public boolean searchable() {
    return true;
  }

  public String title() {
    return toUpperCaseFirst(getClass().getSimpleName());
  }

  public boolean childCrud() {
    return false;
  }

  public abstract String state();

  public abstract void setStateTo(String state);
}
