package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public abstract class ActionSupplierLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends ValidationDtoSupplierLayer<View, Editor, CreationForm, Filters, Row, IdType>
    implements ActionSupplier {

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
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
      actions.add(Action.builder().id("action-on-row-*").build());
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
      getAllMethods(getClass()).stream()
          .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
          .forEach(
              method -> {
                actions.add(
                    Action.builder()
                        .id("action-on-row-" + method.getName())
                        .confirmationRequired(
                            method.getAnnotation(ListToolbarButton.class).confirmationRequired())
                        .rowsSelectedRequired(
                            method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                        .bubble(true)
                        .build());
              });
    }
    return actions;
  }
}
