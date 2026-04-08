package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.declarative.WizardOrchestrator.addRowNumber;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.*;
import java.util.stream.Collectors;
import lombok.SneakyThrows;

public class CreateActionHandler {

  @SneakyThrows
  public static Object handleCreate(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, actionId.endsWith("and-stay"));
    _editing.put(fieldId, !actionId.endsWith("and-stay"));

    String rowClassName =
        httpRequest.runActionRq().componentState().get(fieldId + "_rowClass").toString();
    var rowClassx = getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");
    var rowClass = Class.forName(rowClassName);

    var filteredState =
        httpRequest.runActionRq().componentState().entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(fieldId + "-"))
            .filter(entry -> entry.getValue() != null)
            .collect(
                Collectors.toMap(
                    entry -> entry.getKey().substring((fieldId + "-").length()),
                    Map.Entry::getValue));
    var item = MateuInstanceFactory.newInstance(rowClass, filteredState, null);

    var list = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    ;
    if (list == null) {
      list = List.of(fromJson(toJson(item)));
    } else {
      list = new ArrayList<>(list);
      list.add(fromJson(toJson(item)));
    }
    list.forEach(
        map -> {
          if (!map.containsKey("_rowNumber")) {
            map.put("_rowNumber", UUID.randomUUID().toString());
          }
        });
    var newState = new HashMap<>(httpRequest.runActionRq().componentState());
    newState.put(fieldId, list);
    addRowNumber(getGenericClass(field, List.class, "E"), newState);
    newState.put("_show_detail", _show_detail);
    newState.put("_editing", _editing);
    return new State(newState);
  }
}
