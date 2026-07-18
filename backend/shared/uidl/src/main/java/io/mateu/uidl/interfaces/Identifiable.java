package io.mateu.uidl.interfaces;

/**
 * Marks a CRUD entity/row by exposing its {@code String} identifier via {@link #id()}. {@link
 * CrudStore} requires its entity type to be {@code Identifiable} so the framework knows which field
 * is the id.
 */
public interface Identifiable {

  String id();
}
