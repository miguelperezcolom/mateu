package io.mateu.uidl.interfaces;

/**
 * Decides at runtime whether a given form member (field) should be rendered read-only. Implement
 * {@link #isReadOnly(String, HttpRequest)} to return {@code true} for the field {@code memberName}
 * when it must not be editable in the context of the current request (e.g. based on state or
 * permissions).
 */
public interface ReadOnlySupplier {

  boolean isReadOnly(String memberName, HttpRequest httpRequest);
}
