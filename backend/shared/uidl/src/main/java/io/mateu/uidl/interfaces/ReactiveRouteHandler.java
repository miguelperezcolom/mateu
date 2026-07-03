package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

/**
 * Reactive (Project Reactor) counterpart of {@link RouteHandler}. Implement {@link
 * #handleRoute(String, HttpRequest)} to resolve a {@code route} to the view/component to render,
 * returning it wrapped in a {@link Mono} for non-blocking backends.
 */
public interface ReactiveRouteHandler {

  Mono<?> handleRoute(String route, HttpRequest httpRequest);
}
