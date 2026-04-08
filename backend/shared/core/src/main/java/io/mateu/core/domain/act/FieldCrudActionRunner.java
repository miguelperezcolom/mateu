package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.crudfieldhandlers.AddActionHandler.handleAdd;
import static io.mateu.core.domain.act.crudfieldhandlers.CancelActionHandler.handleCancel;
import static io.mateu.core.domain.act.crudfieldhandlers.CreateActionHandler.handleCreate;
import static io.mateu.core.domain.act.crudfieldhandlers.NextActionHandler.handleNext;
import static io.mateu.core.domain.act.crudfieldhandlers.PrevActionHandler.handlePrev;
import static io.mateu.core.domain.act.crudfieldhandlers.RemoveActionHandler.handleRemove;
import static io.mateu.core.domain.act.crudfieldhandlers.SaveActionHandler.handleSave;
import static io.mateu.core.domain.act.crudfieldhandlers.SelectActionHandler.handleSelect;
import static io.mateu.core.domain.act.crudfieldhandlers.SelectedActionHandler.handleSelected;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.declarative.AutoCrudOrchestrator;
import io.mateu.core.infra.declarative.CrudOrchestrator;
import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import reactor.core.publisher.Flux;

@Named
public class FieldCrudActionRunner implements ActionRunner {

  @Override
  public int priority() {
    return 100;
  }

  @Override
  public boolean supports(Object instance, String actionId, HttpRequest httpRequest) {
    if (actionId == null || actionId.isEmpty()) {
      return false;
    }
    if (actionId.contains("_")) {
      String fieldId = actionId.substring(0, actionId.indexOf('_'));
      var field = getFieldByName(getViewModelClass(instance, httpRequest), fieldId);
      if (field != null && List.class.isAssignableFrom(field.getType())) {
        if (actionId.endsWith("_create")
            || actionId.endsWith("_create-and-stay")
            || actionId.endsWith("_add")
            || actionId.endsWith("_select")
            || actionId.endsWith("_selected")
            || actionId.endsWith("_prev")
            || actionId.endsWith("_next")
            || actionId.endsWith("_save")
            || actionId.endsWith("_remove")
            || actionId.endsWith("_cancel")) {
          return true;
        }
      }
    }
    return false;
  }

  public static Class getViewModelClass(Object instance, HttpRequest httpRequest) {
    if (instance instanceof AutoCrudOrchestrator<?> autoCrudOrchestrator) {
      return autoCrudOrchestrator.entityClass();
    }
    if (instance instanceof FormViewModel formViewModel) {
      return formViewModel.entityClass();
    }
    if (instance instanceof CrudOrchestrator<?, ?, ?, ?, ?, ?> crudOrchestrator) {
      var _state = httpRequest.runActionRq().componentState().get("_state");
      if ("create".equals(_state)) {
        return crudOrchestrator.creationFormClass();
      }
      if ("edit".equals(_state)) {
        return crudOrchestrator.editorClass();
      }
      if ("view".equals(_state)) {
        return crudOrchestrator.viewClass();
      }
      return crudOrchestrator.viewModelClass();
    }
    return instance.getClass();
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    var fieldId = actionId.substring(0, actionId.indexOf('_'));
    var field = getFieldByName(getViewModelClass(instance, command.httpRequest()), fieldId);

    var httpRequest = command.httpRequest();
    var _state = (String) httpRequest.runActionRq().componentState().get("_state");
    var _show_detail =
        (Map<String, Object>) httpRequest.runActionRq().componentState().get("_show_detail");
    var _editing = (Map<String, Object>) httpRequest.runActionRq().componentState().get("_editing");

    if (_show_detail == null) {
      _show_detail = new HashMap<>();
    }
    if (_editing == null) {
      _editing = new HashMap<>();
    }

    if (actionId.endsWith("_create")) {
      return Flux.just(
          handleCreate(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_create-and-stay")) {
      return Flux.just(
          handleCreate(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_add")) {
      return Flux.just(
          handleAdd(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_select")) {
      return Flux.just(
          handleSelect(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_selected")) {
      return Flux.just(
          handleSelected(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_prev")) {
      return Flux.just(
          handlePrev(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_next")) {
      return Flux.just(
          handleNext(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_save")) {
      return Flux.just(
          handleSave(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_remove")) {
      return Flux.just(
          handleRemove(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    if (actionId.endsWith("_cancel")) {
      return Flux.just(
          handleCancel(
              instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId));
    }
    throw new RuntimeException("no handler for action " + actionId);
  }
}
