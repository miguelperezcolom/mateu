package io.mateu.uidl.interfaces;

/**
 * Implemented by a form to provide field labels at runtime (an alternative to the static
 * {@code @Label} annotation). {@link #label(String, HttpRequest)} returns the label for the field
 * named {@code memberName}.
 */
public interface LabelSupplier {

  String label(String memberName, HttpRequest httpRequest);
}
