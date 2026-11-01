package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NavigateActionHandler {

  public static Object handlePrev(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    return navigate(httpRequest, field, fieldId, -1);
  }

  public static Object handleNext(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    return navigate(httpRequest, field, fieldId, 1);
  }

  private static Object navigate(
      HttpRequest httpRequest, Field field, String fieldId, int direction) {
    var initiatorState =
        (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
    var rowNumber = initiatorState.get("_rowNumber");

    var items = (List<Map<String, Object>>) httpRequest.runActionRq().componentState().get(fieldId);
    var currentPosition = CrudFieldHandlerHelper.findPositionByRowNumber(items, rowNumber);

    if (direction < 0 && currentPosition <= 0) {
      throw new RuntimeException("This is the first item. No previous item to select.");
    }
    if (direction > 0 && currentPosition >= items.size() - 1) {
      throw new RuntimeException("No more items");
    }

    var newPosition = currentPosition + direction;
    var data = new HashMap<>(items.get(newPosition));
    data.put("_position", (newPosition + 1) + "/" + items.size());

    // A row whose fields show by its own values (VisibilitySupplier) needs its editor re-built for
    // the neighbour, not only re-filled: the neighbour may be of another type.
    var rowClass = CrudFieldHandlerHelper.rowClass(field, fieldId, httpRequest);
    if (VisibilitySupplier.class.isAssignableFrom(rowClass)) {
      var item = MateuInstanceFactory.newInstance(rowClass, data, httpRequest);
      return CrudFieldHandlerHelper.editRowEditor(field, fieldId, httpRequest, item, data);
    }

    return UIFragmentDto.builder()
        .targetComponentId(fieldId + "-container")
        .state(data)
        .action(UIFragmentActionDto.Replace)
        .build();
  }
}
