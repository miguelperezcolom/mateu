package io.mateu.uidl.interfaces;

/**
 * Contract for a wrapper/mediator that exposes an underlying domain model object. Implement {@link
 * #model()} to return the backing model instance that Mateu should introspect and render, letting a
 * view delegate its content to a separate model object.
 */
public interface ModelSupplier {

  Object model();
}
