package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.UploadEnabled;
import java.util.ArrayList;
import java.util.List;

final class CrudActionsBuilder {

  static List<Action> buildActions(Crud<?, ?, ?, ?, ?, ?> orchestrator, HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    if (httpRequest.getAttribute("mediator") != null) {
      actions.add(Action.builder().id("delete").build());
      actions.add(Action.builder().id("save").build());
      actions.add(Action.builder().id("create").build());
      actions.add(Action.builder().id("new").build());
      actions.add(Action.builder().id("view").build());
      actions.add(Action.builder().id("edit").build());
      actions.add(Action.builder().id("cancel-create").build());
      actions.add(Action.builder().id("cancel-view").build());
      actions.add(Action.builder().id("cancel-edit").build());
      actions.add(Action.builder().id("cancel-new").build());
      actions.add(Action.builder().id("action-on-row-*").build());
      actions.add(Action.builder().id("action-on-view-*").build());
    }
    if (httpRequest.getAttribute("list") != null) {
      actions.add(Action.builder().id("search").build());
      actions.add(
          Action.builder()
              .id("delete")
              .confirmationRequired(true)
              .rowsSelectedRequired(true)
              .bubble(true)
              .build());
      if (orchestrator instanceof UploadEnabled) {
        actions.add(Action.builder().id("import").build());
        actions.add(Action.builder().id("process-import").build());
      }
      if (orchestrator instanceof Auditable) {
        actions.add(Action.builder().id("history").build());
      }
      getAllMethods(orchestrator.getClass()).stream()
          .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
          .forEach(
              method ->
                  actions.add(
                      Action.builder()
                          .id("action-on-row-" + method.getName())
                          .confirmationRequired(
                              method.getAnnotation(ListToolbarButton.class).confirmationRequired())
                          .rowsSelectedRequired(
                              method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                          .bubble(true)
                          .build()));
    }
    if (httpRequest.getAttribute("view") != null) {
      getAllMethods(orchestrator.getClass()).stream()
          .filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
          .forEach(
              method ->
                  actions.add(
                      Action.builder()
                          .id("action-on-view-" + method.getName())
                          .confirmationRequired(
                              method.getAnnotation(ViewToolbarButton.class).confirmationRequired())
                          .bubble(true)
                          .build()));
    }
    return actions;
  }
}
