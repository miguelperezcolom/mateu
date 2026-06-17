package io.mateu.core.domain.act;

import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.List;
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
            || actionId.endsWith("_cancel")
            || actionId.endsWith("_move-up")
            || actionId.endsWith("_move-down")) {
          return true;
        }
      }
    }
    return false;
  }

  public static Class getViewModelClass(Object instance, HttpRequest httpRequest) {
    if (instance instanceof AutoCrud<?> autoCrud) {
      return autoCrud.entityClass();
    }
    if (instance instanceof FormViewModel formViewModel) {
      return formViewModel.entityClass();
    }
    if (instance instanceof Crud<?, ?, ?, ?, ?, ?> crudOrchestrator) {
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
      return crudOrchestrator.entityClass();
    }
    return instance.getClass();
  }

  @SneakyThrows
  @Override
  public Flux<?> run(Object instance, RunActionCommand command) {
    var actionId = command.actionId();
    var fieldId = actionId.substring(0, actionId.indexOf('_'));
    var field = getFieldByName(getViewModelClass(instance, command.httpRequest()), fieldId);
    return Flux.just(
        CrudFieldActionDispatcher.dispatch(
            instance, actionId, fieldId, field, command.httpRequest()));
  }
}
