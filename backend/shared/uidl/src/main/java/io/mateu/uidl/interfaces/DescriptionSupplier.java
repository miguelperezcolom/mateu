package io.mateu.uidl.interfaces;

/**
 * Implemented by a form to provide field descriptions (helper text) at runtime. {@link
 * #description(String, HttpRequest)} returns the description for the field named {@code
 * memberName}.
 */
public interface DescriptionSupplier {

  String description(String memberName, HttpRequest httpRequest);
}
