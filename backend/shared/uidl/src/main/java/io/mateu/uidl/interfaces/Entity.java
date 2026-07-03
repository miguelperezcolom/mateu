package io.mateu.uidl.interfaces;

/**
 * Contract for a domain entity that exposes its identifier via {@link #id()}. Unlike {@link
 * Identifiable} (whose id is a {@code String}), the id type is generic.
 *
 * @param <IdType> the type of the entity's identifier
 */
public interface Entity<IdType> {

  IdType id();
}
