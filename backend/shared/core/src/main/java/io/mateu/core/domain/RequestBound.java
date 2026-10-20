package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;

/**
 * A view that keeps the request being served — wiring, not state — because it builds its tree
 * lazily, in a {@code Callable<Component>} field, whose hooks need the request and whose built-in
 * texts are translated for it (the archetypes: calendar, to-do list, collection detail, general
 * overview).
 *
 * <p>Mateu hands the request over as soon as it has the instance for a request — created and
 * hydrated, about to be mapped, or about to be checked for the action it is asked to run — so it is
 * there before any of those builds the tree. Before, the archetypes learnt it from {@code
 * triggers(...)}, which the mapping calls AFTER it has invoked the field: on a first render the
 * hooks got a null request and the texts ignored the browser's language.
 */
public interface RequestBound {

  void bindRequest(HttpRequest httpRequest);

  /** Hands {@code httpRequest} to {@code view} when it wants it. */
  static void bind(Object view, HttpRequest httpRequest) {
    if (view instanceof RequestBound bound && httpRequest != null) {
      bound.bindRequest(httpRequest);
    }
  }
}
