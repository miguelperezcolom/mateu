package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getFieldId;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.declarative.orchestrators.wizard.Wizard.addRowNumber;
import static io.mateu.core.infra.reflection.ClassLoaders.forName;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.*;
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

    // _rowClass only rides in the state for wizard steps; plain forms resolve the row type
    // from the field's generic type.
    var stateRowClass = httpRequest.runActionRq().componentState().get(fieldId + "_rowClass");
    var rowClass =
        stateRowClass != null
            ? forName(stateRowClass.toString())
            : getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");

    Map<String, Object> filteredState =
        (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
    var item = MateuInstanceFactory.newInstance(rowClass, filteredState, null);

    var list = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
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
    var newState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
    newState.put(fieldId, list);
    addRowNumber(getGenericClass(field, List.class, "E"), newState);

    if (actionId.endsWith("_create-and-stay")) {
      var newItem = MateuInstanceFactory.newInstance(rowClass, Map.of(), httpRequest);
      String fid = getFieldId(field, "", false);
      return List.of(
          new State(newState),
          wrap(
                  CrudFieldHandlerHelper.buildDetailForm(
                      "New "
                          + toUpperCaseFirst(
                              getGenericClass(field, field.getType(), "E").getSimpleName()),
                      field,
                      httpRequest,
                      true,
                      null,
                      List.<UserTrigger>of(
                          Button.builder().label("Cancel").actionId(fid + "_cancel").build(),
                          Button.builder().label("Save").actionId(fid + "_create").build(),
                          Button.builder()
                              .label("Save and Add Another")
                              .actionId(fid + "_create-and-stay")
                              .build()),
                      0),
                  newItem,
                  (String) httpRequest.getAttribute("baseUrl"),
                  httpRequest.runActionRq().route(),
                  httpRequest.runActionRq().consumedRoute(),
                  httpRequest.runActionRq().initiatorComponentId(),
                  httpRequest)
              .withContainerId(fieldId + "-container"));
    }

    return new State(newState);
  }
}
