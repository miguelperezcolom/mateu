package io.mateu.uidl.interfaces;

/**
 * Implemented by a form to decide at runtime whether individual fields are disabled. {@link
 * #isDisabled(String, HttpRequest)} returns {@code true} to disable the field named {@code
 * memberName}.
 */
public interface DisabledSupplier {

  boolean isDisabled(String memberName, HttpRequest httpRequest);
}
