package io.mateu.uidl.data;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

/**
 * The mount's catalogue of named REST sources: every endpoint the UI consumes, declared once.
 *
 * <p>Two producers feed one table, exactly like {@link RouteTable}: {@code @RestSource} annotations
 * and {@code RestSourceCatalogSupplier} beans are the DERIVED half, an authored {@code
 * sources.yaml} is merged on top, and <strong>the authored entry wins</strong> — explicit beats
 * derived, the same rule the route registry and the layout inference already follow.
 *
 * <p>It travels: to the browser so a renderer can resolve a reference, and into the static bundle's
 * manifest ONCE rather than per route — which is what makes re-pointing a CDN deployment at another
 * environment an edit of one entry instead of a rebuild.
 */
public record RestSourceCatalog(List<RestSourceEntry> sources) {

  public RestSourceCatalog {
    sources = sources == null ? List.of() : List.copyOf(sources);
  }

  public static RestSourceCatalog empty() {
    return new RestSourceCatalog(List.of());
  }

  public boolean isEmpty() {
    return sources.isEmpty();
  }

  /** The entry a surface references, or empty when the catalogue does not name it. */
  public Optional<RestSourceEntry> get(String name) {
    if (name == null || name.isBlank()) {
      return Optional.empty();
    }
    var wanted = name.trim();
    return sources.stream().filter(entry -> wanted.equals(entry.name())).findFirst();
  }

  /**
   * Merges this (authored) catalogue over a derived one, entry by entry and keyed by name. An
   * authored entry REPLACES the derived one outright rather than being combined field by field: a
   * half-overridden endpoint would be far harder to reason about than a replaced one — the same
   * reasoning as {@link RouteTable#mergedOver}.
   */
  public RestSourceCatalog mergedOver(RestSourceCatalog derived) {
    var byName = new LinkedHashMap<String, RestSourceEntry>();
    if (derived != null) {
      for (var entry : derived.sources()) {
        byName.put(entry.name(), entry);
      }
    }
    for (var entry : sources) {
      byName.put(entry.name(), entry);
    }
    return new RestSourceCatalog(List.copyOf(byName.values()));
  }

  /** Only the entries this project has to implement — the input of the server generator. */
  public List<RestSourceEntry> toImplement() {
    return sources.stream()
        .filter(entry -> entry.effectiveProvenance() == RestSourceProvenance.generate)
        .toList();
  }

  /** Only the entries somebody else already serves — dependencies, never generated. */
  public List<RestSourceEntry> consumed() {
    return sources.stream()
        .filter(entry -> entry.effectiveProvenance() == RestSourceProvenance.existing)
        .toList();
  }
}
