package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;

/**
 * A reference to a named business component in the {@link ComponentCatalog} (coherence-plan #13):
 * drop {@code new ComponentRef("AgencySelector")} anywhere a component goes and it stands for that
 * catalogue entry's bound composition.
 *
 * <p>A dedicated reference type rather than a {@code ref} field on every component — the same shape
 * {@code RestDataSource.ref} uses for sources: the reference is a thing, not an attribute smeared
 * across the whole component family. The server substitutes it with the resolved composition before
 * rendering; when no backend is present the reference travels on the wire and the client-side
 * expander resolves it against the shipped catalogue. An unknown name renders as a graceful
 * placeholder, never an error.
 *
 * @param ref the catalogue name to resolve
 */
public record ComponentRef(String ref) implements Component {}
