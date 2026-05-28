package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.domain.out.componentmapper.ReflectionFormFieldMapper.getDetailFormColumns;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getForm;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class CrudFieldHandlerHelper {

  static Map<String, Object> newStateMap(
      HttpRequest httpRequest, Map<String, Object> showDetail, Map<String, Object> editing) {
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    newState.put("_show_detail", showDetail);
    newState.put("_editing", editing);
    return newState;
  }

  static State buildState(
      HttpRequest httpRequest, Map<String, Object> showDetail, Map<String, Object> editing) {
    return new State(newStateMap(httpRequest, showDetail, editing));
  }

  static int findPositionByRowNumber(List<Map<String, Object>> items, Object rowNumber) {
    for (int i = 0; i < items.size(); i++) {
      if (rowNumber.equals(items.get(i).get("_rowNumber"))) {
        return i;
      }
    }
    throw new RuntimeException("Item with row number " + rowNumber + " not found");
  }

  static Component buildDetailForm(
      String title,
      Field field,
      HttpRequest httpRequest,
      boolean isNew,
      List<Component> header,
      List<Component> toolbar) {
    var builder =
        Form.builder()
            .title(title)
            .style("width: 100%;")
            .content(
                getForm(
                        "",
                        getGenericClass(field, field.getType(), "E"),
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        isNew,
                        false,
                        getDetailFormColumns(field))
                    .stream()
                    .toList())
            .toolbar(toolbar);
    if (header != null && !header.isEmpty()) {
      builder = builder.header(header);
    }
    return builder.build();
  }
}
