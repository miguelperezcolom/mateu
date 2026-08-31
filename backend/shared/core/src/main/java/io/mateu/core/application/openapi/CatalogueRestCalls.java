package io.mateu.core.application.openapi;

import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import java.util.ArrayList;
import java.util.List;

/**
 * The calls a REST source catalogue declares — one operation per named entry.
 *
 * <p>This is the PRIMARY reader now, and the reason the catalogue was worth building before
 * deriving anything: an entry states the endpoint's identity, whether the project owes it, what it
 * exposes and what to call it. Reading inline declarations off classes or wire JSON can only ever
 * recover part of that, because a URL repeated in five screens does not say it is one endpoint, and
 * nothing in a URL says whether we are supposed to implement it.
 *
 * <p>It also makes the derivation work for a mount authored entirely in YAML with no Java at all —
 * the case a purely static, CDN-served deployment is.
 */
final class CatalogueRestCalls {

  private CatalogueRestCalls() {}

  static List<RestCall> from(RestSourceCatalog catalogue) {
    if (catalogue == null || catalogue.hasNoSources()) {
      return List.of();
    }
    var calls = new ArrayList<RestCall>();
    for (var entry : catalogue.sources()) {
      var call = callOf(entry);
      if (call != null) {
        calls.add(call);
      }
    }
    return calls;
  }

  private static RestCall callOf(RestSourceEntry entry) {
    var source = entry.source();
    if (source == null || source.url() == null || source.url().isBlank()) {
      return null;
    }
    var params = new ArrayList<RestCall.Param>();
    for (var name : OpenApiEmitter.placeholders(source.url(), source.body())) {
      params.add(RestCall.Param.required(name));
    }
    return new RestCall(
        entry.name(),
        source.url(),
        source.method(),
        params,
        responseOf(entry),
        "the source catalogue",
        "Named source",
        entry.description(),
        entry.effectiveProvenance());
  }

  /**
   * What the entry says it reads back. The field map is the richest thing any reader has: it states
   * the fields AND the paths they live at, which is exactly what a schema needs. Failing that, a
   * select's value/label paths still name two fields.
   *
   * <p>The declared PATHS travel, not the flat aliases: the schema describes the endpoint's
   * payload, and an alias is how the UI consumes it, not what the server returns.
   */
  private static RestCall.ResponseShape responseOf(RestSourceEntry entry) {
    var source = entry.source();
    var fields = new ArrayList<RestCall.Field>();
    entry.fields().values().forEach(path -> addPath(fields, path));
    var mapsItems =
        !entry.fields().isEmpty()
            || notBlank(source.itemsPath())
            || notBlank(entry.totalPath())
            || notBlank(source.valuePath())
            || notBlank(source.labelPath());
    if (!mapsItems) {
      // Nothing about this entry maps ITEMS — no items path, no per-item paths, no total. It
      // answers
      // one thing, so describing it as an array would be inventing a shape. This is the ordinary
      // case
      // for an action endpoint.
      return RestCall.ResponseShape.result("");
    }
    if (fields.isEmpty()) {
      addPath(fields, source.valuePath());
      addPath(fields, source.labelPath());
    }
    return RestCall.ResponseShape.items(source.itemsPath(), entry.totalPath(), fields);
  }

  private static boolean notBlank(String value) {
    return value != null && !value.isBlank();
  }

  private static void addPath(List<RestCall.Field> fields, String path) {
    if (path == null || path.isBlank()) {
      return;
    }
    if (fields.stream().noneMatch(f -> f.path().equals(path))) {
      fields.add(new RestCall.Field(path, "string"));
    }
  }
}
