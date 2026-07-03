package io.mateu.uidl.interfaces;

/**
 * Supplies a CSS style string for a form member at runtime. Implement {@link #style(String,
 * HttpRequest)} to compute the inline style applied to the field {@code memberName} dynamically
 * (e.g. conditional colouring based on the current state).
 */
public interface StyleSupplier {

  String style(String memberName, HttpRequest httpRequest);
}
