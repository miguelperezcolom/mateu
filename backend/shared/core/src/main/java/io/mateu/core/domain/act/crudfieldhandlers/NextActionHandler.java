package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.infra.declarative.CrudOrchestrator.getIndex;

import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NextActionHandler {

  public static Object handleNext(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {

    var initiatorState = (Map<String, Object>) httpRequest.runActionRq().parameters().get("initiatorState");
    var rowNumber = initiatorState.get("_rowNumber");

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


    var newState = new HashMap<>();

    if (position >= items.size() - 1) {
      throw new RuntimeException("No more items");
    }

    position++;
    data = (HashMap<String, Object>) items.get(position);

    newState = new HashMap<>();
     newState.putAll(data);
    newState.put("_position", "" + (position + 1) + "/" + items.size());

    return UIFragmentDto.builder()
            .targetComponentId(fieldId + "-container")
            .state(newState)
            .action(UIFragmentActionDto.Replace)
            .build();
  }
}
