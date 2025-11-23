package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface ReactiveRouteHandler {

  Mono<?> handleRoute(String route, HttpRequest httpRequest);
}
