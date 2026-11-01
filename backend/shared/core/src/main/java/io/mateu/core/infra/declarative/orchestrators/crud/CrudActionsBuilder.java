package io.mateu.core.infra.declarative.orchestrators.crud;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ToolbarButtons;
import io.mateu.uidl.interfaces.Auditable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.UploadEnabled;
import java.util.ArrayList;
import java.util.List;

final class CrudActionsBuilder {

  static List<Action> buildActions(Crud<?, ?, ?, ?, ?, ?> orchestrator, HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    if (httpRequest.getAttribute("mediator") != null) {
      // only the writes the crud lets the user make (CrudWriteGate): an advertised write that the
      // gate then refuses would still be a 403, but nothing should invite it
      var mayEdit = CrudWriteGate.mayEdit(orchestrator);
      var mayCreate = CrudWriteGate.mayCreate(orchestrator);
      if (CrudWriteGate.mayDelete(orchestrator)) {
        actions.add(Action.builder().id("delete").build());
      }
      if (mayEdit) {
        actions.add(Action.builder().id("save").build());
      }
      if (mayCreate) {
        actions.add(Action.builder().id("create").build());
      }
      if (mayEdit && orchestrator.editInDrawer() && orchestrator.display().saveAndNext().shown()) {
        // the edit drawer's "Save and next" bubbles to the mediator like save does
        actions.add(Action.builder().id("save-and-next").build());
      }
      if (mayCreate) {
        actions.add(Action.builder().id("new").build());
      }
      actions.add(Action.builder().id("view").build());
      if (mayEdit) {
        actions.add(Action.builder().id("edit").build());
      }
      actions.add(Action.builder().id("cancel-create").build());
      actions.add(Action.builder().id("cancel-view").build());
      actions.add(Action.builder().id("cancel-edit").build());
      actions.add(Action.builder().id("cancel-new").build());
      actions.add(Action.builder().id("action-on-row-*").build());
      actions.add(Action.builder().id("action-on-view-*").build());
      if (InlineEditingGate.offered(orchestrator)) {
        actions.add(Action.builder().id("update-row").build());
      }
    }
    if (httpRequest.getAttribute("list") != null) {
      actions.add(Action.builder().id("search").build());
      if (InlineEditingGate.offered(orchestrator)) {
        actions.add(Action.builder().id("update-row").build());
      }
      if (CrudWriteGate.mayDelete(orchestrator)) {
        actions.add(
            Action.builder()
                .id("delete")
                .confirmationRequired(true)
                .rowsSelectedRequired(true)
                .bubble(true)
                .build());
      }
      // the Export buttons of the list toolbar (ListRouteResolver): advertised, or dropped
      actions.addAll(io.mateu.uidl.interfaces.Listing.exportActions(orchestrator));
      if (orchestrator.behaviourSource() instanceof UploadEnabled) {
        actions.add(Action.builder().id("import").build());
        actions.add(Action.builder().id("process-import").build());
      }
      if (orchestrator.behaviourSource() instanceof Auditable) {
        actions.add(Action.builder().id("history").build());
      }
      getAllMethods(orchestrator.behaviourSource().getClass()).stream()
          .filter(method -> MetaAnnotations.isPresent(method, ListToolbarButton.class))
          .forEach(
              method -> {
                var placement = MetaAnnotations.find(method, ListToolbarButton.class);
                actions.add(
                    ToolbarButtons.toolbarAction(
                            "action-on-row-" + method.getName(),
                            MetaAnnotations.find(method, io.mateu.uidl.annotations.Action.class),
                            placement.confirmationRequired(),
                            placement.rowsSelectedRequired())
                        .withBubble(true));
              });
    }
    if (httpRequest.getAttribute("view") != null) {
      getAllMethods(orchestrator.behaviourSource().getClass()).stream()
          .filter(method -> MetaAnnotations.isPresent(method, ViewToolbarButton.class))
          .forEach(
              method ->
                  actions.add(
                      ToolbarButtons.toolbarAction(
                              "action-on-view-" + method.getName(),
                              MetaAnnotations.find(method, io.mateu.uidl.annotations.Action.class),
                              MetaAnnotations.find(method, ViewToolbarButton.class)
                                  .confirmationRequired(),
                              false)
                          .withBubble(true)));
    }
    return actions;
  }
}
