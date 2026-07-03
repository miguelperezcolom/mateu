package io.mateu.uidl.interfaces;

/**
 * Implemented by a component to supply the data object bound to its UI (the model whose fields
 * populate/round-trip through the form). {@link #data(HttpRequest)} returns that object for the
 * current request.
 */
public interface DataSupplier {

  Object data(HttpRequest httpRequest);
}
