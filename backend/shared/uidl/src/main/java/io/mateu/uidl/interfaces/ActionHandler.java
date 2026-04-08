package io.mateu.uidl.interfaces;

public interface ActionHandler {

  default boolean supportsAction(String actionId) {
    return actionId != null
        && !"".equals(actionId)
        && !actionId.endsWith("_create")
        && !actionId.endsWith("_add")
        && !actionId.endsWith("_select")
        && !actionId.endsWith("_selected")
        && !actionId.endsWith("_prev")
        && !actionId.endsWith("_next")
        && !actionId.endsWith("_save")
        && !actionId.endsWith("_remove")
        && !actionId.endsWith("_cancel");
  }

  Object handleAction(String actionId, HttpRequest httpRequest);
}
