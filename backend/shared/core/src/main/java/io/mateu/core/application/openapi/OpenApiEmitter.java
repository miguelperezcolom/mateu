package io.mateu.core.application.openapi;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestData;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Derives the OpenAPI a UI implies, from the endpoints its screens already declare.
 *
 * <p>This is not a new capability — it is a <b>latent artifact made explicit</b>. Every
 * {@code @RestOptions}, {@code @RestListing}, {@code @RestData} and {@code @RestAction} already
 * states a URL, a method, the parameters it interpolates and the shape it expects back. That IS an
 * endpoint contract; nobody had written it down.
 *
 * <p>So the declaration stops deriving one artifact and starts deriving two: the UI, and the
 * contract the server behind it has to satisfy.
 *
 * <p><b>It is a LOWER BOUND, and saying so matters.</b> What a screen declares tells you the paths,
 * the methods, the parameters and the fields it reads back. It cannot tell you error codes,
 * authentication, idempotency, side effects or business rules. "This is the minimum your API must
 * satisfy" is exact and useful; "this generates your API" would be false.
 */
public final class OpenApiEmitter {

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** {@code ${state.x}} / {@code ${data.y}} / {@code ${searchText}} interpolation. */
  private static final Pattern PLACEHOLDER = Pattern.compile("\\$\\{([^}]+)}");

  private OpenApiEmitter() {}

  /** One declared call: where it goes, how, and what the screen reads back. */
  record Call(
      String url,
      String method,
      List<String> params,
      String readsPath,
      String declaredBy,
      String kind) {}

  /** The OpenAPI 3 document the given views imply. */
  public static ObjectNode emit(String title, Iterable<Class<?>> views) {
    var calls = new ArrayList<Call>();
    for (var view : views) {
      collect(view, calls);
    }

    var root = MAPPER.createObjectNode();
    root.put("openapi", "3.0.3");
    var info = root.putObject("info");
    info.put("title", title);
    info.put("version", "1.0.0");
    info.put(
        "description",
        "Derived from the endpoints the UI declares. This is the MINIMUM the API must satisfy: it"
            + " carries paths, methods, parameters and the fields the screens read back. It cannot"
            + " carry error codes, authentication, idempotency or business rules — those are yours.");

    // One server entry per distinct origin, so paths stay relative and readable.
    var servers = new LinkedHashMap<String, String>();
    for (var call : calls) {
      var origin = origin(call.url());
      if (origin != null) {
        servers.putIfAbsent(origin, origin);
      }
    }
    var serversNode = root.putArray("servers");
    servers.keySet().forEach(origin -> serversNode.addObject().put("url", origin));

    var paths = root.putObject("paths");
    for (var call : calls) {
      var path = path(call.url());
      var item = paths.has(path) ? (ObjectNode) paths.get(path) : paths.putObject(path);
      var operation = item.putObject(call.method().toLowerCase());
      operation.put("summary", call.kind() + " declared by " + call.declaredBy());
      operation.put(
          "description",
          "Declared by the UI. The screen reads "
              + (call.readsPath().isBlank() ? "the response root" : "`" + call.readsPath() + "`")
              + ".");
      if (!call.params().isEmpty()) {
        var parameters = operation.putArray("parameters");
        for (var name : call.params()) {
          var parameter = parameters.addObject();
          parameter.put("name", name);
          parameter.put("in", "query");
          parameter.put(
              "required",
              true); // the screen interpolates it, so a response without it cannot be right
          parameter.putObject("schema").put("type", "string");
        }
      }
      operation
          .putObject("responses")
          .putObject("200")
          .put("description", "The shape the screen reads");
    }
    return root;
  }

  private static void collect(Class<?> view, List<Call> calls) {
    var name = view.getSimpleName();

    var listing = view.getAnnotation(RestListing.class);
    if (listing != null) {
      calls.add(
          new Call(
              listing.url(),
              listing.method(),
              placeholders(listing.url(), listing.body()),
              listing.itemsPath(),
              name,
              "Listing rows"));
    }
    var data = view.getAnnotation(RestData.class);
    if (data != null) {
      calls.add(
          new Call(
              data.url(),
              data.method(),
              placeholders(data.url(), data.body()),
              data.resultPath(),
              name,
              "Screen data"));
    }
    for (var field : view.getDeclaredFields()) {
      var options = field.getAnnotation(RestOptions.class);
      if (options != null) {
        calls.add(
            new Call(
                options.url(),
                options.method(),
                placeholders(options.url(), options.body()),
                options.itemsPath(),
                name + "." + field.getName(),
                "Options for a field"));
      }
    }
    for (var method : view.getDeclaredMethods()) {
      var action = method.getAnnotation(RestAction.class);
      if (action != null) {
        calls.add(
            new Call(
                action.url(),
                action.method(),
                placeholders(action.url(), action.body()),
                action.resultPath(),
                name + "." + method.getName() + "()",
                "Action"));
      }
    }
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
    try {
      return MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(emit(title, views));
    } catch (Exception e) {
      throw new IllegalStateException("could not serialise the derived OpenAPI", e);
    }
  }

  /** Exposed for the emitter's own tests. */
  static Map<String, Object> debugCalls(Class<?> view) {
    var calls = new ArrayList<Call>();
    collect(view, calls);
    var out = new LinkedHashMap<String, Object>();
    for (var call : calls) {
      out.put(call.declaredBy(), call.method() + " " + call.url());
    }
    return out;
  }
}
