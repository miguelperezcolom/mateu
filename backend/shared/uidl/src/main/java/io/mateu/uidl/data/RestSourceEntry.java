package io.mateu.uidl.data;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * One named entry of the {@link RestSourceCatalog}: an endpoint declared ONCE, that any number of
 * surfaces then reference by {@link #name()} instead of repeating its URL.
 *
 * <p>Why the indirection earns its keep: inlining the descriptor at each surface means the same
 * endpoint declared in five screens is five copies to edit, there is nowhere to state the things
 * that are true of the endpoint rather than of one screen (base URL, auth, {@code proxy}, secrets),
 * and a statically deployed bundle cannot be re-pointed at another environment without being
 * rebuilt. It also makes the identity of an endpoint DECLARED rather than guessed by comparing URLs
 * — which is what lets the derived API contract name one operation per source.
 *
 * @param name what surfaces reference; unique within the catalog
 * @param source how to reach it (url, method, headers, body, itemsPath)
 * @param provenance whether somebody already serves it or this project still owes it — see {@link
 *     RestSourceProvenance}
 * @param fields the fields this source EXPOSES, as {@code name -> dot path} into each item. It is
 *     what lets a nested response field be consumed under a flat name ({@code customerName ->
 *     customer.name}), which a surface cannot express on its own because a column id is used
 *     directly as the path. A surface referring to a name this map does not mention reads it as a
 *     path, unchanged — so declaring nothing keeps today's behaviour.
 * @param totalPath a dot path to the total number of matching items, for an endpoint that pages
 *     server-side; blank means the response carries no total and the renderer pages what it fetched
 *     in memory
 * @param description a line for humans, and the {@code summary} of the derived operation
 */
public record RestSourceEntry(
    String name,
    RestDataSource source,
    RestSourceProvenance provenance,
    Map<String, String> fields,
    String totalPath,
    String description) {

  public RestSourceEntry {
    name = name == null ? "" : name.trim();
    provenance = provenance == null ? RestSourceProvenance.auto : provenance;
    fields = fields == null ? Map.of() : Map.copyOf(fields);
    totalPath = totalPath == null ? "" : totalPath;
    description = description == null ? "" : description;
  }

  /** A source with no field mapping and an inferred provenance — the common case. */
  public RestSourceEntry(String name, RestDataSource source) {
    this(name, source, RestSourceProvenance.auto, Map.of(), "", "");
  }

  /** The effective provenance, never {@code auto}. */
  public RestSourceProvenance effectiveProvenance() {
    return RestSourceProvenance.resolve(provenance, source == null ? null : source.url());
  }

  /**
   * The dot path a consumer reading {@code name} should follow. An unmapped name IS its own path,
   * so a surface that names a response field directly keeps working with no catalog entry for it.
   */
  public String pathOf(String fieldName) {
    var mapped = fields.get(fieldName);
    return mapped == null || mapped.isBlank() ? fieldName : mapped;
  }

  /** This entry with the given field mapping added, for building a catalog fluently. */
  public RestSourceEntry withField(String fieldName, String path) {
    var merged = new LinkedHashMap<>(fields);
    merged.put(fieldName, path);
    return new RestSourceEntry(name, source, provenance, merged, totalPath, description);
  }
}
