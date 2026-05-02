package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import lombok.SneakyThrows;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.*;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.*;
import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getFieldId;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getForm;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

public class SelectActionHandler {

  @SneakyThrows
  public static Object handleSelect(
      Object instance,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, true);
    _editing.put(fieldId, true);

    var rowNumber = httpRequest.runActionRq().parameters().get("_rowNumber");

    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var data = new HashMap<String, Object>();
    var position = 0;
    for (Map<String, Object> item : items) {
      if (rowNumber.equals(item.get("_rowNumber"))) {
        data.putAll(item);
        break;
      }
      position++;
    }


    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    data.put("_position", "" + (position + 1) + "/" + items.size());

    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);

    String rowClassName =
            httpRequest.runActionRq().componentState().get(fieldId + "_rowClass").toString();
    var rowClassx = getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");
    var rowClass = Class.forName(rowClassName);

    Map<String, Object> filteredState =
            (Map<String, Object>) httpRequest.runActionRq().parameters();
    var item = MateuInstanceFactory.newInstance(rowClass, filteredState, null);
    addRowNumber(rowClass, data);

    return List.of(new State(newState), wrap(
            createForm(field, httpRequest),
            item,
            (String) httpRequest.getAttribute("baseUrl"),
            httpRequest.runActionRq().route(),
            httpRequest.runActionRq().consumedRoute(),
            httpRequest.runActionRq().initiatorComponentId(),
            httpRequest
    ).withContainerId(fieldId + "-container").withInitialData(data));
  }

  private static Component createForm(Field field, HttpRequest httpRequest) {
    var prefix = "";
    var readOnly = false;
    return Form.builder()
            .title("Update " + getLabel(field))
            .content(
                    getForm(
                            prefix,
                            getGenericClass(field, field.getType(), "E"),
                            "base_url",
                            httpRequest.runActionRq().route(),
                            httpRequest.runActionRq().consumedRoute(),
                            httpRequest.runActionRq().initiatorComponentId(),
                            httpRequest,
                            false,
                            readOnly,
                            getDetailFormColumns(field))
                            .stream()
                            .toList())
            .header(
                    List.of(
                            io.mateu.uidl.data.Text.builder()
                                    .text(
                                            "${state['_position']}")
                                    .build()))
            .toolbar(
                    List.of(
                            Button.builder()
                                    .label("Prev")
                                    .actionId(getFieldId(field, prefix, readOnly) + "_prev")
                                    .build(),
                            Button.builder()
                                    .label("Next")
                                    .actionId(getFieldId(field, prefix, readOnly) + "_next")
                                    .build(),
                            Button.builder()
                                    .label("Cancel")
                                    .actionId(getFieldId(field, prefix, readOnly) + "_cancel")
                                    .build(),
                            Button.builder()
                                    .label("Save")
                                    .actionId(getFieldId(field, prefix, readOnly) + "_save")
                                    .build()))
            .build();
  }

}
