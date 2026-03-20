package io.mateu.core.infra.declarative.crudorchestrator.actionhandlers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.AddActionHandler.handleAdd;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.CancelActionHandler.handleCancel;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.CreateActionHandler.handleCreate;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.NextActionHandler.handleNext;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.PrevActionHandler.handlePrev;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.RemoveActionHandler.handleRemove;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.SaveActionHandler.handleSave;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.SelectActionHandler.handleSelect;
import static io.mateu.core.infra.declarative.crudorchestrator.actionhandlers.crudfieldhandlers.SelectedActionHandler.handleSelected;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.*;
import lombok.SneakyThrows;

public class FieldCrudActionHandler {

  @SneakyThrows
  public static Object handleFieldCrudAction(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing) {
    for (Field field : getAllFields(crudOrchestrator.entityClass())) {
      if (List.class.isAssignableFrom(field.getType())
          && !field.isAnnotationPresent(ForeignKey.class)
          && !field.isAnnotationPresent(Composition.class)
          && !isBasic(field.getType())) {
        return handleFieldCrudAction(
            crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field);
      }
    }
    return new State(crudOrchestrator);
  }

  private static Object handleFieldCrudAction(
      CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field) {
    String fieldId = actionId.substring(0, actionId.indexOf('_'));
    if (actionId.endsWith("_create")) {
      return handleCreate(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_add")) {
      return handleAdd(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_select")) {
      return handleSelect(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_selected")) {
      return handleSelected(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_prev")) {
      return handlePrev(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_next")) {
      return handleNext(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_save")) {
      return handleSave(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_remove")) {
      return handleRemove(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_cancel")) {
      return handleCancel(
          crudOrchestrator, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    return new State(crudOrchestrator);
  }
}
