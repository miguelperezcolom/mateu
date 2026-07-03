package io.mateu.uidl.interfaces;

/**
 * Contract for a view/mediator that supplies the component state to serialize to the frontend.
 * Implement {@link #state(HttpRequest)} to return the object whose fields become the component's
 * {@code componentState} (round-tripped back on the next action), instead of using the view
 * instance itself as its state.
 */
public interface StateSupplier {

  Object state(HttpRequest httpRequest);
}
