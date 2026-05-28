package io.mateu.core.domain.act.crudfieldhandlers;

import io.mateu.uidl.data.State;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.Map;

public class CancelActionHandler {

  public static Object handleCancel(
      Object crudOrchestrator,
      String actionId,
      HttpRequest httpRequest,
      String _state,
      Map<String, Object> _show_detail,
      Map<String, Object> _editing,
      Field field,
      String fieldId) {
    _show_detail.put(fieldId, false);
    _editing.put(fieldId, false);
    return CrudFieldHandlerHelper.buildState(httpRequest, _show_detail, _editing);
  }
}
