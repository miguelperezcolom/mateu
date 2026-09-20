package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;

/**
 * One named entry of the {@link ComponentCatalog}: a reusable BOUND composition of EXISTING
 * components — a shape + a data source + optional behaviour — declared ONCE and referenced by
 * {@link #name()} (coherence-plan #13, "business components"). An "agency selector" is a {@code
 * dropdown + source(agencies)}, named {@code AgencySelector}, then used as {@code @Component(ref =
 * "AgencySelector")} wherever an agency must be picked.
 *
 * <p>It is the exact twin of {@link RestSourceEntry}, one level up: a source names an ENDPOINT, a
 * business component names a COMPOSITION (which may itself reference a source). Because it composes
 * pieces the renderer already paints, it introduces NO new rendering — it ports for free and runs
 * with no backend (coherence-plan #1); the client-side expander resolves the reference against the
 * shipped catalogue exactly as it resolves a source reference.
 *
 * @param name what surfaces reference; unique within the catalogue
 * @param component the bound composition this name stands for
 */
public record ComponentEntry(String name, Component component) {

  public ComponentEntry {
    name = name == null ? "" : name.trim();
  }
}
