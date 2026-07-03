package io.mateu.uidl.interfaces;

/**
 * Resolves the human-readable display label for a lookup field's currently selected value.
 * Implement {@link #label(String, Object, HttpRequest)} to turn the stored id of the field {@code
 * fieldName} into the text shown to the user (e.g. mapping a customer id to the customer's name).
 */
public interface LookupLabelSupplier {

  String label(String fieldName, Object id, HttpRequest httpRequest);
}
