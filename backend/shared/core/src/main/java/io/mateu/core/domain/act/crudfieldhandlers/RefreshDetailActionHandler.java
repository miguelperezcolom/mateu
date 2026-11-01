package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {@code <field>_refresh-detail}: the open row editor asks to be re-built with the values being
 * edited, because a field its row's {@code VisibilitySupplier} depends on changed (the trigger
 * {@link RowVisibilityTriggers} declares). Answers only the editor, targeted at {@code
 * <field>-container} with the edited values as its state: the holder's state — the list, which
 * editor is open — does not change.
 */
public class RefreshDetailActionHandler {

  public static Object handleRefreshDetail(
      Object instance,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    var initiatorState = httpRequest.runActionRq().parameters().get("initiatorState");
    var data =
        new HashMap<String, Object>(
            initiatorState instanceof Map<?, ?> map
                ? (Map<String, Object>) map
                : httpRequest.runActionRq().componentState());
    var rowClass = CrudFieldHandlerHelper.rowClass(field, fieldId, httpRequest);
    var item = MateuInstanceFactory.newInstance(rowClass, data, httpRequest);
    // an existing row's editor carries its position ("2/5"); a new row's does not
    var editor =
        data.containsKey("_position")
            ? CrudFieldHandlerHelper.editRowEditor(field, fieldId, httpRequest, item, data)
            : CrudFieldHandlerHelper.newRowEditor(field, fieldId, httpRequest, item)
                .withInitialData(data);
    return List.of(editor);
  }
}
