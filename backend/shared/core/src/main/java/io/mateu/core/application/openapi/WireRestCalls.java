package io.mateu.core.application.openapi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The calls a RENDERED UI declares, read off wire JSON.
 *
 * <p>This is what makes the derivation independent of the authoring channel. The other two readers
 * see a Java class or a catalogue; this one sees the wire, which is where all three channels
 * converge — annotations, an authored YAML page, and a view that builds its sources at runtime all
 * end up as the same {@code optionsSource} / {@code rowsSource} / {@code restAction} on the way to
 * the renderer. A mount authored entirely in YAML contributes nothing to the class reader and
 * everything to this one.
 *
 * <p>Its natural input is a static bundle's {@code manifest.json}, whose entries are pre-rendered
 * increments — so the contract can be derived from a bundle alone, with no classpath at all.
 *
 * <p>It walks the tree looking for the keys rather than for known DTO shapes: metadata records nest
 * deeply and keep being reorganised, and a reader that knew the nesting would go quietly blind the
 * next time a surface moved.
 */
final class WireRestCalls {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** The synthetic action a {@code @RestData} screen travels as. */
  private static final String RESTDATA_ACTION_ID = "__restdata__";

  private WireRestCalls() {}

  /** The calls declared anywhere in the given wire documents. */
  static List<RestCall> from(Iterable<String> wireDocuments) {
    var calls = new ArrayList<RestCall>();
    if (wireDocuments == null) {
      return calls;
    }
    for (var document : wireDocuments) {
      if (document == null || document.isBlank()) {
        continue;
      }
      try {
        walk(MAPPER.readTree(document), calls, new LinkedHashMap<>());
      } catch (Exception e) {
        // One unreadable document contributes nothing; the others still do. A derivation that
        // refused to run because a single entry was malformed would be less useful than a partial
        // one
        // that says what it found.
        continue;
      }
    }
    return calls;
  }

  /**
   * Descends the whole tree, collecting sources and remembering the field types seen on the way so
   * a placeholder can be typed from the form field it names.
   */
  private static void walk(JsonNode node, List<RestCall> calls, Map<String, String> fieldTypes) {
    if (node == null) {
      return;
    }
    if (node.isArray()) {
      node.forEach(child -> walk(child, calls, fieldTypes));
      return;
    }
    if (!node.isObject()) {
      return;
    }

    rememberFieldType(node, fieldTypes);

    var options = node.get("optionsSource");
    if (options != null && options.isObject()) {
      calls.add(
          call(
              options,
              optionsResponse(options),
              declaredBy(node, "a field"),
              "Options for a field",
              fieldTypes));
    }
    var rows = node.get("rowsSource");
    if (rows != null && rows.isObject()) {
      calls.add(
          call(
              rows,
              rowsResponse(rows, node),
              declaredBy(node, "a listing"),
              "Listing rows",
              fieldTypes));
    }
    var restAction = node.get("restAction");
    if (restAction != null && restAction.isObject()) {
      var source = restAction.get("source");
      if (source != null && source.isObject()) {
        var screenData = RESTDATA_ACTION_ID.equals(text(node, "id"));
        calls.add(
            call(
                source,
                RestCall.ResponseShape.result(text(restAction, "resultPath")),
                declaredBy(node, screenData ? "a screen" : "an action"),
                screenData ? "Screen data" : "Action",
                fieldTypes));
      }
    }

    node.fields().forEachRemaining(entry -> walk(entry.getValue(), calls, fieldTypes));
  }

  private static RestCall call(
      JsonNode source,
      RestCall.ResponseShape response,
      String declaredBy,
      String kind,
      Map<String, String> fieldTypes) {
    var params = new ArrayList<RestCall.Param>();
    for (var name : OpenApiEmitter.placeholders(text(source, "url"), text(source, "body"))) {
      var type = SchemaTypes.ofWire(fieldTypes.get(name)).asParamType();
      params.add(new RestCall.Param(name, type, true));
    }
    return new RestCall(
        text(source, "ref"),
        text(source, "url"),
        text(source, "method"),
        params,
        response,
        declaredBy,
        kind,
        "",
        io.mateu.uidl.data.RestSourceProvenance.auto);
  }

  /**
   * A select reads two fields per item, and the descriptor names both.
   *
   * <p>Except when it REFERENCES a source: {@code @RestOptions} defaults these paths to {@code
   * value} and {@code label}, and a default is not a declaration — the referenced entry's own
   * mapping is authoritative, so carrying the defaults through would describe fields the endpoint
   * never has. A path the surface actually overrode still counts, because overriding the mapping of
   * a shared source is deliberate.
   */
  private static RestCall.ResponseShape optionsResponse(JsonNode source) {
    var reference = !text(source, "ref").isBlank();
    var fields = new ArrayList<RestCall.Field>();
    addDeclaredPath(fields, text(source, "valuePath"), reference, "value");
    addDeclaredPath(fields, text(source, "labelPath"), reference, "label");
    return RestCall.ResponseShape.items(text(source, "itemsPath"), "", fields);
  }

  private static void addDeclaredPath(
      List<RestCall.Field> fields, String path, boolean reference, String annotationDefault) {
    if (reference && annotationDefault.equals(path)) {
      return;
    }
    addPath(fields, path);
  }

  /**
   * A listing reads each COLUMN from every item, so the grid's columns are the response fields —
   * the richest shape any reader recovers without a catalogue entry.
   */
  private static RestCall.ResponseShape rowsResponse(JsonNode source, JsonNode listing) {
    var fields = new ArrayList<RestCall.Field>();
    collectColumnIds(listing.get("columns"), fields);
    return RestCall.ResponseShape.items(text(source, "itemsPath"), "", fields);
  }

  /**
   * The column ids under a listing's {@code columns}. A column travels wrapped in a component whose
   * metadata holds the id, so this descends rather than reading the array directly.
   */
  private static void collectColumnIds(JsonNode node, List<RestCall.Field> fields) {
    if (node == null) {
      return;
    }
    if (node.isArray()) {
      node.forEach(child -> collectColumnIds(child, fields));
      return;
    }
    if (!node.isObject()) {
      return;
    }
    var id = text(node, "id");
    if (!id.isBlank() && node.has("dataType")) {
      var type = SchemaTypes.ofWire(text(node, "dataType"));
      if (fields.stream().noneMatch(f -> f.path().equals(id))) {
        fields.add(new RestCall.Field(id, type.asParamType()));
      }
      return;
    }
    node.fields().forEachRemaining(entry -> collectColumnIds(entry.getValue(), fields));
  }

  /** A form field's declared type, so a placeholder naming it can be typed. */
  private static void rememberFieldType(JsonNode node, Map<String, String> fieldTypes) {
    var fieldId = text(node, "fieldId");
    if (!fieldId.isBlank() && node.has("dataType")) {
      fieldTypes.putIfAbsent(fieldId, text(node, "dataType"));
    }
  }

  /** Who carried the descriptor, for the operation's description. */
  private static String declaredBy(JsonNode node, String fallback) {
    var fieldId = text(node, "fieldId");
    if (!fieldId.isBlank()) {
      return fieldId;
    }
    var id = text(node, "id");
    return id.isBlank() ? fallback : id;
  }

  private static void addPath(List<RestCall.Field> fields, String path) {
    if (path != null && !path.isBlank() && fields.stream().noneMatch(f -> f.path().equals(path))) {
      fields.add(new RestCall.Field(path, "string"));
    }
  }

  private static String text(JsonNode node, String field) {
    return node != null && node.hasNonNull(field) ? node.get(field).asText() : "";
  }
}
