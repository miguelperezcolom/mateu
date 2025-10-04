package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface RouteHandler {

  Mono<?> handleRoute(String route, HttpRequest httpRequest);
}
