package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.*;
import static io.mateu.core.infra.declarative.orchestrators.wizard.Wizard.addRowNumber;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.util.*;
import lombok.SneakyThrows;

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

    var newState = CrudFieldHandlerHelper.newStateMap(httpRequest, _show_detail, _editing);
    data.put("_position", "" + (position + 1) + "/" + items.size());

    String rowClassName =
        httpRequest.runActionRq().componentState().get(fieldId + "_rowClass").toString();
    var rowClassx = getGenericClass((ParameterizedType) field.getGenericType(), List.class, "E");
    var rowClass = Class.forName(rowClassName);

    Map<String, Object> filteredState =
        (Map<String, Object>) httpRequest.runActionRq().parameters();
    var item = MateuInstanceFactory.newInstance(rowClass, filteredState, null);
    addRowNumber(rowClass, data);

    String fid = getFieldId(field, "", false);
    return List.of(
        new State(newState),
        wrap(
                CrudFieldHandlerHelper.buildDetailForm(
                    "Update "
                        + toUpperCaseFirst(
                            getGenericClass(field, field.getType(), "E").getSimpleName()),
                    field,
                    httpRequest,
                    false,
                    List.of(Text.builder().text("${state['_position']}").build()),
                    List.<UserTrigger>of(
                        Button.builder().label("Prev").actionId(fid + "_prev").build(),
                        Button.builder().label("Next").actionId(fid + "_next").build(),
                        Button.builder().label("Cancel").actionId(fid + "_cancel").build(),
                        Button.builder().label("Save").actionId(fid + "_save").build()),
                    0),
                item,
                (String) httpRequest.getAttribute("baseUrl"),
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest)
            .withContainerId(fieldId + "-container")
            .withInitialData(data));
  }
}
