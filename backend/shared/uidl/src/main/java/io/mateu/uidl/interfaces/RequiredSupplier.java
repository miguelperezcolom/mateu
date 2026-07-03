package io.mateu.uidl.interfaces;

/**
 * Decides at runtime whether a given form member (field) is required. Implement {@link
 * #isRequired(String, HttpRequest)} to return {@code true} for the field {@code memberName} when it
 * must be filled in, computed dynamically from the current request/state rather than a static
 * {@code @NotNull}.
 */
public interface RequiredSupplier {

  boolean isRequired(String memberName, HttpRequest httpRequest);
}
