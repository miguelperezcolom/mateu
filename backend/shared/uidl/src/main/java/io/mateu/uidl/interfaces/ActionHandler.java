package io.mateu.uidl.interfaces;

import java.util.List;

/**
 * A component that handles custom actions itself. Implement this to intercept action ids in {@link
 * #handleAction(String, HttpRequest)} and return the resulting view/state; {@link
 * #supportedActions()} and {@link #supportsAction(String)} declare which ids this handler claims
 * (by default everything except the framework's built-in CRUD/list ids such as {@code *_save},
 * {@code *_create}, {@code *_selected}, {@code search-*}).
 */
public interface ActionHandler {

  default List<String> supportedActions() {
    return List.of("*");
  }

  default boolean supportsAction(String actionId) {
    return actionId != null
        && !"".equals(actionId)
        && !actionId.endsWith("_create")
        && !actionId.endsWith("_create-and-stay")
        && !actionId.endsWith("_add")
        && !actionId.endsWith("_select")
        && !actionId.endsWith("_selected")
        && !actionId.endsWith("_prev")
        && !actionId.endsWith("_next")
        && !actionId.endsWith("_save")
        && !actionId.endsWith("_remove")
        && !actionId.endsWith("_move-up")
        && !actionId.endsWith("_move-down")
        && !actionId.endsWith("_cancel")
        && !actionId.startsWith("search-");
  }

  Object handleAction(String actionId, HttpRequest httpRequest);
}
