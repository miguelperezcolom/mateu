package io.mateu.uidl.interfaces;

/**
 * Produces a value for a field automatically (e.g. a default, id, or sequence). Implement {@link
 * #generate()} to return the value Mateu assigns to the associated field.
 */
public interface ValueGenerator {

  Object generate();
}
