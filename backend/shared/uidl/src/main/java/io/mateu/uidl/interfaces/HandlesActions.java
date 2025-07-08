package io.mateu.uidl.interfaces;

public interface HandlesActions {

  boolean supportsAction(String actionId);

  Object handleAction(String actionId, HttpRequest httpRequest);
}
