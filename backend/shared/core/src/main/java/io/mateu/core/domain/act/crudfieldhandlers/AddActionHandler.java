package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getForm;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.util.*;
import lombok.SneakyThrows;

public class AddActionHandler {

  @SneakyThrows
  public static Object handleAdd(
      Object instance,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, true);
    _editing.put(fieldId, false);

    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);
    addRowNumber(instance.getClass(), newState);

    String rowClassName =
        httpRequest.runActionRq().componentState().get(fieldId + "_rowClass").toString();
    var rowClass = Class.forName(rowClassName);

    var item = MateuInstanceFactory.newInstance(rowClass, Map.of(), httpRequest);

    return List.of(
        new State(newState),
        wrap(
                createForm(field, httpRequest),
                item,
                (String) httpRequest.getAttribute("baseUrl"),
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest)
            .withContainerId(fieldId + "-container"));
  }

  private static Component createForm(Field field, HttpRequest httpRequest) {
    var prefix = "";
    var readOnly = false;
    return Form.builder()
        .title("New " + getLabel(field))
        .content(
            getForm(
                    prefix,
                    getGenericClass(field, field.getType(), "E"),
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest,
                    true,
                    readOnly,
                    getDetailFormColumns(field))
                .stream()
                .toList())
        .toolbar(
            List.of(
                Button.builder()
                    .label("Cancel")
                    .actionId(getFieldId(field, prefix, readOnly) + "_cancel")
                    .build(),
                Button.builder()
                    .label("Save")
                    .actionId(getFieldId(field, prefix, readOnly) + "_create")
                    .build(),
                Button.builder()
                    .label("Save and Add Another")
                    .actionId(getFieldId(field, prefix, readOnly) + "_create-and-stay")
                    .build()))
        .build();
  }
}
