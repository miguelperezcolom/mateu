package io.mateu.uidl.interfaces;

/**
 * Implemented by a view/model that needs a post-construction hook after Mateu has populated its
 * fields from the incoming request state. {@link #hydrate(HttpRequest)} is invoked to let it derive
 * or load any additional data (e.g. resolve lookups) before rendering.
 */
public interface Hydratable {

  void hydrate(HttpRequest httpRequest);
}
