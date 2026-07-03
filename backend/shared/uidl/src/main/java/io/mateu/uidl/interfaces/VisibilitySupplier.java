package io.mateu.uidl.interfaces;

/**
 * Decides at runtime whether a given form member (field) is hidden. Implement {@link
 * #isHidden(String, HttpRequest)} to return {@code true} to hide the field {@code memberName} in
 * the context of the current request (e.g. based on state or permissions).
 */
public interface VisibilitySupplier {

  boolean isHidden(String memberName, HttpRequest httpRequest);
}
