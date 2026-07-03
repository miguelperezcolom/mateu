package io.mateu.uidl.interfaces;

/**
 * An {@link Identifiable} entity that also exposes a human-readable name. Implement {@link #name()}
 * to provide the display label used, for example, as the caption of the entity in lookups and
 * option lists.
 */
public interface Named extends Identifiable {

  String name();
}
