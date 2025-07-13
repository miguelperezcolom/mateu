package io.mateu.uidl.interfaces;

public interface HandlesActions {

  default boolean supportsAction(String actionId) {
    return !"create".equals(actionId);
  }

  Object handleAction(String actionId, HttpRequest httpRequest);
}
