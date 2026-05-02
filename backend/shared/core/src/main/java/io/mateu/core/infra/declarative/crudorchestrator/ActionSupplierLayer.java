package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
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
  public List<Action> actions() {
    var actions = new ArrayList<Action>();
    actions.add(
        Action.builder()
            .id("delete")
            .confirmationRequired(true)
            .rowsSelectedRequired(true)
            .build());
    actions.add(Action.builder().id("save").build());
    actions.add(Action.builder().id("create").build());
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
                      .build());
            });
    return actions;
  }
}
