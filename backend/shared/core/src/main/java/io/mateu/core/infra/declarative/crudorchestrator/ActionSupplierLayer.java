package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.annotations.Composition;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    actions.add(Action.builder().id("save").validationRequired(true).build());
    actions.add(Action.builder().id("create").validationRequired(true).build());
    addActionsForChildCrudForm(actions, viewModelClass());
    getAllMethods(getClass()).stream()
        .filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
        .forEach(
            method -> {
              actions.add(
                  Action.builder()
                      .id("action-on-row-" + method.getName())
                      .confirmationRequired(
                          method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                      .rowsSelectedRequired(
                          method.getAnnotation(ListToolbarButton.class).rowsSelectedRequired())
                      .build());
            });
    return actions;
  }

  private void addActionsForChildCrudForm(ArrayList<Action> actions, Class<?> formClass) {
    getAllEditableFields(formClass).stream()
        .filter(
            field ->
                List.class.isAssignableFrom(field.getType())
                    && !field.isAnnotationPresent(Lookup.class)
                    && !field.isAnnotationPresent(Composition.class)
                    && !isBasic(field.getType()))
        .forEach(
            field -> {
              var rowClass = getGenericClass(field, field.getType(), "E");
              var fieldsToValidate =
                  getAllEditableFields(rowClass).stream()
                      .map(Field::getName)
                      .map(f -> field.getName() + "-" + f)
                      .collect(Collectors.joining(","));
              actions.add(
                  Action.builder()
                      .id(field.getName() + "_create")
                      .validationRequired(true)
                      .fieldsToValidate(fieldsToValidate)
                      .build());
              actions.add(
                  Action.builder()
                      .id(field.getName() + "_create-and-stay")
                      .validationRequired(true)
                      .fieldsToValidate(fieldsToValidate)
                      .build());
              actions.add(
                  Action.builder()
                      .id(field.getName() + "_save")
                      .validationRequired(true)
                      .fieldsToValidate(fieldsToValidate)
                      .build());
              actions.add(
                  Action.builder()
                      .id(field.getName() + "_next")
                      .validationRequired(true)
                      .fieldsToValidate(fieldsToValidate)
                      .build());
              actions.add(
                  Action.builder()
                      .id(field.getName() + "_prev")
                      .validationRequired(true)
                      .fieldsToValidate(fieldsToValidate)
                      .build());
            });
  }
}
