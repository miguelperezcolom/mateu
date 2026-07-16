package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.infra.JsonSerializer.fromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;
import static io.mateu.core.infra.declarative.orchestrators.wizard.Wizard.addRowNumber;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.UserTrigger;
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
    // _rowClass only rides in the state for wizard steps; plain forms resolve the row type
    // from the field's generic type.
    var stateRowClass = httpRequest.runActionRq().componentState().get(fieldId + "_rowClass");
    var rowClass =
        stateRowClass != null
            ? Class.forName(stateRowClass.toString())
            : getGenericClass(field, field.getType(), "E");

    // Inline-editing grids render no detail form (the container the form would target does not
    // exist): "+" appends an empty row to the list, to be edited in place.
    if (MetaAnnotations.isPresent(field, InlineEditing.class)) {
      _show_detail.put(fieldId, false);
      _editing.put(fieldId, false);
      var inlineState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
      var emptyRow = MateuInstanceFactory.newInstance(rowClass, Map.of(), httpRequest);
      var rows =
          (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
      rows = rows == null ? new ArrayList<>() : new ArrayList<>(rows);
      Map<String, Object> row = fromJson(toJson(emptyRow));
      row.put("_rowNumber", UUID.randomUUID().toString());
      rows.add(row);
      inlineState.put(fieldId, rows);
      return new State(inlineState);
    }

    _show_detail.put(fieldId, true);
    _editing.put(fieldId, false);

    var newState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
    addRowNumber(instance.getClass(), newState);

    var item = MateuInstanceFactory.newInstance(rowClass, Map.of(), httpRequest);

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
                item,
                (String) httpRequest.getAttribute("baseUrl"),
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest)
            .withContainerId(fieldId + "-container"));
  }
}
