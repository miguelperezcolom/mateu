package io.mateu.uidl.interfaces;

/**
 * Implemented by a form to control, at runtime, how many form-layout columns each field spans.
 * {@link #colspan(String, HttpRequest)} returns the colspan for the field named {@code memberName}.
 */
public interface ColspanSupplier {

  int colspan(String memberName, HttpRequest httpRequest);
}
