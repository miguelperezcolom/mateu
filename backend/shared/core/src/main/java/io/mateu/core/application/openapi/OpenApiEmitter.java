package io.mateu.core.application.openapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceProvenance;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Derives the OpenAPI a UI implies, from the endpoints it already declares.
 *
 * <p>This is not a new capability — it is a <b>latent artifact made explicit</b>. Every source in
 * the catalogue, and every
 * {@code @RestOptions}/{@code @RestListing}/{@code @RestData}/{@code @RestAction}, already states a
 * URL, a method, the values it interpolates and the shape it expects back. That IS an endpoint
 * contract; nobody had written it down.
 *
 * <p>So the declaration stops deriving one artifact and starts deriving two: the UI, and the
 * contract the server behind it has to satisfy.
 *
 * <p><b>It is a LOWER BOUND, and saying so matters.</b> What a screen declares tells you the paths,
 * the methods, the parameters and the fields it reads back. It cannot tell you error codes,
 * authentication, idempotency, side effects or business rules. "This is the minimum your API must
 * satisfy" is exact and useful; "this generates your API" would be false — which is why the emitted
 * schemas stay open rather than claiming to be the whole payload.
 *
 * <p>Two things the catalogue adds, and neither is cosmetic. Identity: two surfaces referencing one
 * name are ONE operation, declared rather than guessed by comparing URL strings, and the name
 * becomes the {@code operationId} a generated server is built around. And provenance: {@code
 * x-mateu-provenance} separates the endpoints this project owes from the ones somebody else already
 * serves, so a generator never writes a controller for a third party's API and never silently omits
 * one we do owe.
 */
public final class OpenApiEmitter {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** {@code ${state.x}} / {@code ${data.y}} / {@code ${searchText}} interpolation. */
  private static final Pattern PLACEHOLDER = Pattern.compile("\\$\\{([^}]+)}");

  /** The vendor extension naming the catalogue source an operation came from. */
  static final String SOURCE_EXTENSION = "x-mateu-source";

  /** The vendor extension saying whether this project owes the endpoint. */
  static final String PROVENANCE_EXTENSION = "x-mateu-provenance";

  private OpenApiEmitter() {}

  /**
   * Everything a derivation can read. Three channels, one document — a mount authored purely in
   * YAML has no views and every bit of its contract still comes out.
   *
   * @param views {@code @UI} classes to read {@code @Rest*} annotations off
   * @param wireDocuments rendered wire JSON (a static bundle's manifest entries)
   * @param catalogue the named source catalogue, the richest channel of the three
   */
  public record Declarations(
      List<Class<?>> views, List<String> wireDocuments, RestSourceCatalog catalogue) {

    public Declarations {
      views = views == null ? List.of() : List.copyOf(views);
      wireDocuments = wireDocuments == null ? List.of() : List.copyOf(wireDocuments);
      catalogue = catalogue == null ? RestSourceCatalog.empty() : catalogue;
    }

    public static Declarations ofViews(Iterable<Class<?>> views) {
      var list = new ArrayList<Class<?>>();
      if (views != null) {
        views.forEach(list::add);
      }
      return new Declarations(list, List.of(), RestSourceCatalog.empty());
    }

    public Declarations withCatalogue(RestSourceCatalog catalogue) {
      return new Declarations(views, wireDocuments, catalogue);
    }

    public Declarations withWireDocuments(List<String> documents) {
      return new Declarations(views, documents, catalogue);
    }
  }

  /** The OpenAPI 3 document the given views imply. */
  public static ObjectNode emit(String title, Iterable<Class<?>> views) {
    return emit(title, Declarations.ofViews(views));
  }

  /** The OpenAPI 3 document everything declared implies. */
  public static ObjectNode emit(String title, Declarations declarations) {
    var calls = collect(declarations);

    var root = MAPPER.createObjectNode();
    root.put("openapi", "3.0.3");
    var info = root.putObject("info");
    info.put("title", title == null ? "API" : title);
    info.put("version", "1.0.0");
    info.put(
        "description",
        "Derived from the endpoints the UI declares. This is the MINIMUM the API must satisfy: it"
            + " carries paths, methods, parameters and the fields the screens read back. It cannot"
            + " carry error codes, authentication, idempotency or business rules — those are yours."
            + " Each operation records the source it came from (x-mateu-source) and whether this"
            + " project has to implement it (x-mateu-provenance: generate) or somebody else already"
            + " serves it (existing).");

    // One server entry per distinct origin, so paths stay relative and readable.
    var servers = new LinkedHashMap<String, Boolean>();
    for (var call : calls) {
      var origin = origin(call.url());
      if (origin != null) {
        servers.merge(origin, isExisting(call), (a, b) -> a && b);
      }
    }
    var serversNode = root.putArray("servers");
    servers.forEach(
        (origin, external) -> {
          var server = serversNode.addObject();
          server.put("url", origin);
          server.put(
              "description",
              external
                  ? "An external dependency — already served elsewhere, never generated"
                  : "Served by this project");
        });

    var paths = root.putObject("paths");
    for (var call : calls) {
      var path = path(call.url());
      var item = paths.has(path) ? (ObjectNode) paths.get(path) : paths.putObject(path);
      item.set(call.method().toLowerCase(), operation(call));
    }
    return root;
  }

  /**
   * Every declared call, deduplicated by identity and merged.
   *
   * <p>Order matters: the catalogue goes first because it carries the name, the provenance and the
   * description, and a merge keeps what the first declaration knew. Without the dedupe, the same
   * endpoint reaching the emitter through two channels — once from an annotation, once from the
   * rendered wire — would emit an operation twice and the second would silently overwrite the
   * first.
   */
  private static List<RestCall> collect(Declarations declarations) {
    var byIdentity = new LinkedHashMap<String, RestCall>();
    var all = new ArrayList<RestCall>();
    all.addAll(CatalogueRestCalls.from(declarations.catalogue()));
    all.addAll(AnnotatedRestCalls.from(declarations.views(), declarations.catalogue()));
    all.addAll(WireRestCalls.from(declarations.wireDocuments()));
    for (var call : all) {
      byIdentity.merge(
          call.identity(), call, (existing, incoming) -> existing.mergedWith(incoming));
    }
    // Filtered AFTER merging, not before: a declaration that only NAMES a source carries no url of
    // its own, and dropping it early would throw away exactly what it does know — the types of its
    // parameters, read off the view that references the source. What is still blank after the merge
    // is a reference whose catalogue entry is missing: it names an endpoint nobody described, so
    // there is nothing truthful to emit for it.
    return byIdentity.values().stream()
        .filter(call -> call.url() != null && !call.url().isBlank())
        .toList();
  }

  private static ObjectNode operation(RestCall call) {
    var operation = MAPPER.createObjectNode();
    if (!call.sourceName().isBlank()) {
      operation.put("operationId", call.sourceName());
    }
    operation.put(
        "summary",
        call.summary().isBlank()
            ? call.kind() + " declared by " + call.declaredBy()
            : call.summary());
    operation.put(
        "description",
        "Declared by the UI ("
            + call.declaredBy()
            + "). The screen reads "
            + (call.response().readPath().isBlank()
                ? "the response root"
                : "`" + call.response().readPath() + "`")
            + ".");
    if (!call.sourceName().isBlank()) {
      operation.put(SOURCE_EXTENSION, call.sourceName());
    }
    operation.put(PROVENANCE_EXTENSION, effectiveProvenance(call).name());

    if (!call.params().isEmpty()) {
      var parameters = operation.putArray("parameters");
      for (var param : call.params()) {
        var parameter = parameters.addObject();
        parameter.put("name", param.name());
        parameter.put("in", "query");
        parameter.put("required", param.required());
        var type = SchemaTypes.parse(param.type());
        var schema = parameter.putObject("schema");
        schema.put("type", type.type());
        if (type.format() != null) {
          schema.put("format", type.format());
        }
      }
    }

    var responses = operation.putObject("responses");
    var ok = responses.putObject("200");
    ok.put("description", "The shape the screen reads");
    var schema = responseSchema(call);
    if (schema != null) {
      ok.putObject("content").putObject("application/json").set("schema", schema);
    }
    return operation;
  }

  /**
   * The response schema, as far as the UI knows it.
   *
   * <p>Deliberately OPEN: it says "these fields must be there", never "only these fields are
   * there". The UI knows what it reads and nothing about the rest of the payload, so declaring the
   * shape closed would turn a lower bound into a false statement about the endpoint.
   */
  private static ObjectNode responseSchema(RestCall call) {
    var response = call.response();
    var itemSchema = objectSchema(response.fields());

    if (!response.collection()) {
      if (response.resultPath().isBlank()) {
        return itemSchema;
      }
      return wrap(
          response.resultPath(),
          itemSchema == null ? MAPPER.createObjectNode().put("type", "object") : itemSchema);
    }

    var array = MAPPER.createObjectNode();
    array.put("type", "array");
    array.set(
        "items", itemSchema == null ? MAPPER.createObjectNode().put("type", "object") : itemSchema);

    if (response.itemsPath().isBlank() && response.totalPath().isBlank()) {
      return array; // the response root IS the array
    }
    var envelope =
        response.itemsPath().isBlank()
            ? MAPPER.createObjectNode().put("type", "object")
            : wrap(response.itemsPath(), array);
    if (!response.totalPath().isBlank()) {
      var total = MAPPER.createObjectNode();
      total.put("type", "integer");
      total.put("description", "Total number of matching items (the endpoint pages server-side)");
      merge(envelope, wrap(response.totalPath(), total));
    }
    return envelope;
  }

  /** An object schema whose properties are the given dot paths, nested. */
  private static ObjectNode objectSchema(List<RestCall.Field> fields) {
    if (fields == null || fields.isEmpty()) {
      return null;
    }
    var root = MAPPER.createObjectNode();
    root.put("type", "object");
    root.putObject("properties");
    for (var field : fields) {
      var type = SchemaTypes.parse(field.type());
      var leaf = MAPPER.createObjectNode();
      leaf.put("type", type.type());
      if (type.format() != null) {
        leaf.put("format", type.format());
      }
      merge(root, wrap(field.path(), leaf));
    }
    return root;
  }

  /** {@code a.b.c} + leaf → nested objects with {@code c} at the bottom. */
  private static ObjectNode wrap(String dotPath, ObjectNode leaf) {
    var segments = dotPath.split("\\.");
    var node = leaf;
    for (int i = segments.length - 1; i >= 0; i--) {
      var parent = MAPPER.createObjectNode();
      parent.put("type", "object");
      parent.putObject("properties").set(segments[i], node);
      node = parent;
    }
    return node;
  }

  /** Deep-merges {@code addition}'s properties into {@code target}. */
  private static void merge(ObjectNode target, ObjectNode addition) {
    var additionProperties = addition.get("properties");
    if (additionProperties == null) {
      return;
    }
    if (!target.has("properties")) {
      target.putObject("properties");
    }
    var targetProperties = (ObjectNode) target.get("properties");
    additionProperties
        .fields()
        .forEachRemaining(
            entry -> {
              var existing = targetProperties.get(entry.getKey());
              if (existing != null
                  && existing.isObject()
                  && entry.getValue().isObject()
                  && entry.getValue().has("properties")) {
                merge((ObjectNode) existing, (ObjectNode) entry.getValue());
              } else if (existing == null) {
                targetProperties.set(entry.getKey(), entry.getValue());
              }
            });
  }

  /** The provenance to publish: declared where there is a catalogue entry, inferred otherwise. */
  static RestSourceProvenance effectiveProvenance(RestCall call) {
    return RestSourceProvenance.resolve(call.provenance(), call.url());
  }

  private static boolean isExisting(RestCall call) {
    return effectiveProvenance(call) == RestSourceProvenance.existing;
  }

  /**
   * The interpolated names a call needs. They are what the screen will substitute at fetch time, so
   * an endpoint that ignores them cannot answer correctly — which is why they are emitted as
   * required.
   */
  static List<String> placeholders(String... sources) {
    var found = new ArrayList<String>();
    for (var source : sources) {
      if (source == null) {
        continue;
      }
      var matcher = PLACEHOLDER.matcher(source);
      while (matcher.find()) {
        var raw = matcher.group(1);
        var name = raw.contains(".") ? raw.substring(raw.lastIndexOf('.') + 1) : raw;
        if (!found.contains(name)) {
          found.add(name);
        }
      }
    }
    return found;
  }

  /** The origin of a declared URL, or null when it is relative. */
  static String origin(String url) {
    try {
      var uri = URI.create(stripPlaceholders(url));
      return uri.getScheme() == null ? null : uri.getScheme() + "://" + uri.getAuthority();
    } catch (Exception e) {
      return null;
    }
  }

  /** The path part of a declared URL, always starting with a slash. */
  static String path(String url) {
    try {
      var uri = URI.create(stripPlaceholders(url));
      var path = uri.getPath();
      return path == null || path.isBlank() ? "/" : path;
    } catch (Exception e) {
      return "/";
    }
  }

  /** Placeholders make a URL unparseable; they are not part of the path anyway. */
  private static String stripPlaceholders(String url) {
    return PLACEHOLDER.matcher(url == null ? "" : url).replaceAll("_");
  }

  /** The document as pretty JSON. */
  public static String emitJson(String title, Iterable<Class<?>> views) {
    return emitJson(title, Declarations.ofViews(views));
  }

  /** The document as pretty JSON. */
  public static String emitJson(String title, Declarations declarations) {
    try {
      return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(emit(title, declarations));
    } catch (Exception e) {
      throw new IllegalStateException("could not serialise the derived OpenAPI", e);
    }
  }

  /** Exposed for the emitter's own tests. */
  static Map<String, Object> debugCalls(Class<?> view) {
    var out = new LinkedHashMap<String, Object>();
    for (var call : AnnotatedRestCalls.from(List.of(view))) {
      out.put(call.declaredBy(), call.method() + " " + call.url());
    }
    return out;
  }
}
