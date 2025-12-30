package io.mateu.uidl.interfaces;

public interface ActionHandler {

  default boolean supportsAction(String actionId) {
    return true;
  }

  Object handleAction(String actionId, HttpRequest httpRequest);
}
