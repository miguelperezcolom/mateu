package io.mateu.uidl.data;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

/**
 * The mount's catalogue of named business components (coherence-plan #13): reusable bound
 * compositions declared once and referenced by name.
 *
 * <p>Two producers feed one table, exactly like {@link RestSourceCatalog} and {@link RouteTable}:
 * {@code @BusinessComponent} declarations + {@code ComponentCatalogSupplier} beans are the DERIVED
 * half, an authored {@code specs/ui/components.yaml} is merged on top, and <strong>the authored
 * entry wins</strong>. It travels to the browser (and into the bundle manifest once) so a renderer
 * — or the client-side expander — can resolve a reference with no backend.
 */
public record ComponentCatalog(List<ComponentEntry> components) {

  public ComponentCatalog {
    components = components == null ? List.of() : List.copyOf(components);
  }

  public static ComponentCatalog empty() {
    return new ComponentCatalog(List.of());
  }

  /**
   * Named {@code hasNoComponents} rather than {@code isEmpty}: this record is SERIALISED into the
   * bundle manifest, and Jackson reads an {@code isX()} accessor on a record as an extra property
   * that then fails to deserialise — the same gotcha {@link RestSourceCatalog#hasNoSources()}
   * documents. Any helper added here needs a name that is not a getter.
   */
  public boolean hasNoComponents() {
    return components.isEmpty();
  }

  /** The entry a surface references, or empty when the catalogue does not name it. */
  public Optional<ComponentEntry> get(String name) {
    if (name == null || name.isBlank()) {
      return Optional.empty();
    }
    var wanted = name.trim();
    return components.stream().filter(entry -> wanted.equals(entry.name())).findFirst();
  }

  /**
   * Merges this (authored) catalogue over a derived one, keyed by name. An authored entry REPLACES
   * the derived one outright rather than being combined field by field — the same rule {@link
   * RestSourceCatalog#mergedOver} and {@link RouteTable#mergedOver} follow.
   */
  public ComponentCatalog mergedOver(ComponentCatalog derived) {
    var byName = new LinkedHashMap<String, ComponentEntry>();
    if (derived != null) {
      for (var entry : derived.components()) {
        byName.put(entry.name(), entry);
      }
    }
    for (var entry : components) {
      byName.put(entry.name(), entry);
    }
    return new ComponentCatalog(List.copyOf(byName.values()));
  }
}
