package io.mateu.core.domain.act.crudfieldhandlers;

import static io.mateu.core.infra.declarative.orchestrators.wizard.Wizard.addRowNumber;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.util.*;

public class SelectActionHandler {

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

    var rowClass = CrudFieldHandlerHelper.rowClass(field, fieldId, httpRequest);

    // The row as the holder keeps it, with what the click sent on top (a client may send only the
    // _rowNumber): the editor is built on THIS row, so its suppliers see its values.
    var rowValues = new HashMap<String, Object>(data);
    rowValues.putAll((Map<String, Object>) httpRequest.runActionRq().parameters());
    var item = MateuInstanceFactory.newInstance(rowClass, rowValues, httpRequest);
    addRowNumber(rowClass, data);

    return List.of(
        new State(newState),
        CrudFieldHandlerHelper.editRowEditor(field, fieldId, httpRequest, item, data));
  }
}
