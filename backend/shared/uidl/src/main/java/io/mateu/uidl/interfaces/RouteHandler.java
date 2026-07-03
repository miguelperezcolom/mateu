package io.mateu.uidl.interfaces;

/**
 * Resolves a request route to the view/component instance that should be rendered for it. Implement
 * {@link #handleRoute(String, HttpRequest)} to map the {@code route} (and current {@link
 * HttpRequest}) to the object Mateu will introspect and render. See {@link ReactiveRouteHandler}
 * for the non-blocking variant.
 */
public interface RouteHandler {

  Object handleRoute(String route, HttpRequest httpRequest);
}
