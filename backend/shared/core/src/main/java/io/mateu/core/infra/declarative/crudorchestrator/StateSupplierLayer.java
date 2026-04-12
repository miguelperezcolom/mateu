package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StateSupplier;
import java.lang.reflect.Modifier;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

public abstract class StateSupplierLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends RuleSupplierLayer<View, Editor, CreationForm, Filters, Row, IdType>
    implements StateSupplier {

  @Override
  public Object state(HttpRequest httpRequest) {
    if (httpRequest.getAttribute("selectedItem") != null) {
      var data = toMap();
      var selectedItem = httpRequest.getAttribute("selectedItem");
      if (selectedItem instanceof StateSupplier stateSupplier) {
        data.putAll(toMap(stateSupplier.state(httpRequest)));
      } else {
        data.putAll(toMap(selectedItem));
      }
      if (httpRequest.getAttribute("new") != null) {
        getAllFields(entityClass()).stream()
            .filter(field -> field.isAnnotationPresent(GeneratedValue.class))
            .forEach(
                field -> {
                  var generator =
                      MateuBeanProvider.getBean(field.getAnnotation(GeneratedValue.class).value());
                  var value = generator.generate();
                  data.put(field.getName(), value);
                });
      }
      addRowNumberForEntityClass(data);
      return data;
    }
    var data = toMap();
    addRowNumberForEntityClass(data);
    return data;
  }

  protected Map<String, Object> toMap() {
    return toMap(this);
  }

  protected Map<String, Object> toMap(Object instance) {
    var map = fromJson(toJson(instance));
    getAllEditableFields(instance.getClass()).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !Collection.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
                    && (instance.getClass().isRecord() || !Modifier.isFinal(field.getModifiers())))
        .forEach(
            field -> {
              var value = getValue(field, instance);
              if (value != null) {
                if (value instanceof Class || isBasic(value)) {
                  map.put(field.getName(), value);
                } else {
                  var nestedMap =
                      toMap(value).entrySet().stream()
                          .filter(entry -> entry.getValue() != null)
                          .collect(
                              Collectors.toMap(
                                  entry -> field.getName() + "-" + entry.getKey(),
                                  Map.Entry::getValue));
                  map.putAll(nestedMap);
                }
              }
            });
    return map;
  }

  public void addRowNumberForEntityClass(Map<String, Object> data) {
    addRowNumber(viewModelClass(), data);
  }
}
