package io.mateu.core.domain.act;

import static io.mateu.core.domain.act.crudfieldhandlers.AddActionHandler.handleAdd;
import static io.mateu.core.domain.act.crudfieldhandlers.CancelActionHandler.handleCancel;
import static io.mateu.core.domain.act.crudfieldhandlers.CreateActionHandler.handleCreate;
import static io.mateu.core.domain.act.crudfieldhandlers.MoveDownActionHandler.handleMoveDown;
import static io.mateu.core.domain.act.crudfieldhandlers.MoveUpActionHandler.handleMoveUp;
import static io.mateu.core.domain.act.crudfieldhandlers.NavigateActionHandler.handleNext;
import static io.mateu.core.domain.act.crudfieldhandlers.NavigateActionHandler.handlePrev;
import static io.mateu.core.domain.act.crudfieldhandlers.RemoveActionHandler.handleRemove;
import static io.mateu.core.domain.act.crudfieldhandlers.SaveActionHandler.handleSave;
import static io.mateu.core.domain.act.crudfieldhandlers.SelectActionHandler.handleSelect;
import static io.mateu.core.domain.act.crudfieldhandlers.SelectedActionHandler.handleSelected;

import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

final class CrudFieldActionDispatcher {

  static Object dispatch(
      Object instance, String actionId, String fieldId, Field field, HttpRequest httpRequest) {
    var _state = (String) httpRequest.runActionRq().componentState().get("_state");
    var _show_detail =
        (Map<String, Object>) httpRequest.runActionRq().componentState().get("_show_detail");
    var _editing = (Map<String, Object>) httpRequest.runActionRq().componentState().get("_editing");
    if (_show_detail == null) _show_detail = new HashMap<>();
    if (_editing == null) _editing = new HashMap<>();

    if (actionId.endsWith("_create") || actionId.endsWith("_create-and-stay")) {
      return handleCreate(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_add")) {
      return handleAdd(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_select")) {
      return handleSelect(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_selected")) {
      return handleSelected(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_prev")) {
      return handlePrev(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_next")) {
      return handleNext(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_save")) {
      return handleSave(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_remove")) {
      return handleRemove(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_move-up")) {
      return handleMoveUp(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_move-down")) {
      return handleMoveDown(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    if (actionId.endsWith("_cancel")) {
      return handleCancel(
          instance, actionId, httpRequest, _state, _show_detail, _editing, field, fieldId);
    }
    throw new RuntimeException("no handler for action " + actionId);
  }
}
