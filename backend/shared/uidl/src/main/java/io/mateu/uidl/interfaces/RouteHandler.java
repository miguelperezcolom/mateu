package io.mateu.uidl.interfaces;

public interface RouteHandler {

  Object handleRoute(String route, HttpRequest httpRequest);

}
