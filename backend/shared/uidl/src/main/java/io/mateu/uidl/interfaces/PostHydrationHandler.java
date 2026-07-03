package io.mateu.uidl.interfaces;

/**
 * Lifecycle hook invoked after a component/view instance has been reconstructed (hydrated) from the
 * incoming request state. Implement {@link #onHydrated(HttpRequest)} to run initialization that
 * depends on the fully populated fields and the current {@link HttpRequest} before the view is
 * rendered or an action runs.
 */
public interface PostHydrationHandler {

  void onHydrated(HttpRequest httpRequest);
}
