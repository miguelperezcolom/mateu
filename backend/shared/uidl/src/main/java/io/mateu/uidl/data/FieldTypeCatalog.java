package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

/**
 * The app's catalogue of named {@link FieldTypeEntry field types} — its domain vocabulary. Two
 * producers feed it exactly like the REST source catalogue: {@code specs/ui/types.yaml} (authored)
 * and {@code FieldTypeCatalogSupplier} beans (code); authored wins, entry by entry.
 */
@Experimental("field types (types.yaml)")
public record FieldTypeCatalog(List<FieldTypeEntry> types) {

  public FieldTypeCatalog {
    types = types == null ? List.of() : List.copyOf(types);
  }

  public static FieldTypeCatalog empty() {
    return new FieldTypeCatalog(List.of());
  }

  /** Not {@code isEmpty}: a record serialised by Jackson must not grow an {@code isX} property. */
  public boolean hasNoTypes() {
    return types.isEmpty();
  }

  /** The type with this id, or empty. */
  public Optional<FieldTypeEntry> get(String id) {
    if (id == null || id.isBlank()) {
      return Optional.empty();
    }
    var wanted = id.trim();
    return types.stream().filter(type -> wanted.equals(type.id())).findFirst();
  }

  /**
   * This (authored) catalogue merged over a derived one, keyed by id. An authored type REPLACES the
   * derived one outright rather than being combined attribute by attribute — the same rule as the
   * route registry and the source catalogue.
   */
  public FieldTypeCatalog mergedOver(FieldTypeCatalog derived) {
    var byId = new LinkedHashMap<String, FieldTypeEntry>();
    if (derived != null) {
      derived.types().forEach(type -> byId.put(type.id(), type));
    }
    types.forEach(type -> byId.put(type.id(), type));
    return new FieldTypeCatalog(List.copyOf(byId.values()));
  }
}
