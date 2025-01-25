package io.mateu.uidl.interfaces;

public interface ActionHandler {

  Object handle(Object target, String actionId, HttpRequest httpRequest);
}
