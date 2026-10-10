package io.mateu.core.application.export;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.data.RouteEntry;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The STATIC-SAFETY report of a bundle: every way a route still needs a server.
 *
 * <p>A pre-rendered increment is a <em>snapshot</em>. What a screen does after it is painted has to
 * be declared on the wire — a {@code restAction}, a {@code rowsSource}, a rule — because a method
 * body cannot travel to a CDN. Nothing used to tell an author which of their screens obeyed that;
 * the bundle built fine and the first click on a static host failed with "request failed". This
 * check turns that into a build-time error naming the route and the reason, so a bundle declared
 * static ({@code mateu:bundle -Dmateu.bundle.static=true}) either runs with no backend or does not
 * build.
 *
 * <p>The rules, each a thing only a JVM can do:
 *
 * <ul>
 *   <li>a route that could not be bundled at all (it would be backend-served, and there is none);
 *   <li>{@code @EyesOnly} — a screen that depends on WHO asks cannot be one file for everyone;
 *   <li>Java action methods ({@code @Button}, {@code @Toolbar}, {@code @ListToolbarButton}, …)
 *       without {@code @RestAction}, and {@code ActionHandler}s;
 *   <li>rows from {@code Listing.search} (a {@code Listing} with no {@code @RestListing}) or from a
 *       {@code CrudStore};
 *   <li>a source fetched through the server proxy ({@code proxy: true}), and a DIRECT source that
 *       carries {@code ${secret.…}} — the browser has no secret scope, and a secret in a static
 *       file is not a secret;
 *   <li>in a definition, a button with neither a route nor a declared {@code restAction}: it would
 *       be dispatched to a server.
 * </ul>
 *
 * <p>Reads the classes reflectively and the rest off the WIRE (the exported JSON and the raw
 * definitions), so a rule holds however the screen was authored.
 */
public final class StaticSafetyCheck {

  /** One way {@code route} needs a server. */
  public record Violation(String route, String reason) {
    @Override
    public String toString() {
      return "/" + MateuBundleExporter.normalizedRoute(route) + " — " + reason;
    }
  }

  private static final ObjectMapper MAPPER = new ObjectMapper();

  /** Method annotations that make a method an action the client dispatches to the server. */
  private static final List<String> ACTION_ANNOTATIONS =
      List.of(
          "io.mateu.uidl.annotations.Button",
          "io.mateu.uidl.annotations.Toolbar",
          "io.mateu.uidl.annotations.ListToolbarButton",
          "io.mateu.uidl.annotations.ViewToolbarButton",
          "io.mateu.uidl.annotations.Fab",
          "io.mateu.uidl.annotations.GroupAction",
          "io.mateu.uidl.annotations.WizardCompletionAction");

  static List<Violation> check(
      MateuBundleExporter.BundleManifest manifest,
      Map<String, String> classByRoute,
      ClassLoader cl) {
    var out = new ArrayList<Violation>();
    var catalog = manifest.sources() != null ? manifest.sources() : RestSourceCatalog.empty();
    for (var entry : manifest.entries()) {
      var route = entry.route();
      if (!entry.ok()) {
        out.add(
            new Violation(
                route,
                "could not be bundled, so it would be served by a backend: " + entry.skipReason()));
      }
      var className = classByRoute.get(MateuBundleExporter.normalizedRoute(route));
      out.addAll(checkClass(route, className, cl));
      for (var json : new String[] {entry.json(), entry.contentJson()}) {
        if (json != null) {
          try {
            out.addAll(checkWire(route, MAPPER.readTree(json), catalog));
          } catch (Exception e) {
            out.add(new Violation(route, "its exported JSON could not be read: " + e));
          }
        }
      }
    }
    // Definition-only routes: their raw definition (and the route's own data source) is what the
    // browser runs — whether it was also pre-rendered or ships only as a definition.
    var routes = manifest.routes() != null ? manifest.routes().routes() : List.<RouteEntry>of();
    var definitions =
        manifest.definitions() != null ? manifest.definitions() : Map.<String, JsonNode>of();
    for (var entry : routes) {
      var def = entry.definition() == null ? null : definitions.get(entry.definition());
      if (def == null) {
        continue;
      }
      var route = "/" + entry.route();
      out.addAll(checkDefinition(route, def, catalog));
      for (var data : new RestDataSource[] {entry.data(), entry.appData()}) {
        if (data != null) {
          out.addAll(checkSource(route, MAPPER.valueToTree(data), catalog, "the route's data"));
        }
      }
    }
    return dedupe(out);
  }

  private static List<Violation> dedupe(List<Violation> in) {
    return new ArrayList<>(new LinkedHashSet<>(in));
  }

  // ── classes ────────────────────────────────────────────────────────────────────────────────────

  static List<Violation> checkClass(String route, String className, ClassLoader cl) {
    var out = new ArrayList<Violation>();
    if (className == null || className.isBlank()) {
      return out;
    }
    Class<?> type;
    try {
      type =
          Class.forName(
              className, false, cl != null ? cl : StaticSafetyCheck.class.getClassLoader());
    } catch (Throwable t) {
      return out;
    }
    var simple = type.getSimpleName();
    if (type.isAnnotationPresent(EyesOnly.class)) {
      out.add(new Violation(route, simple + " declares @EyesOnly: it depends on who asks"));
    }
    if (io.mateu.uidl.interfaces.Listing.class.isAssignableFrom(type)
        && !hasAnnotation(type, RestListing.class)) {
      out.add(
          new Violation(
              route,
              simple
                  + " is a Listing with no @RestListing: its rows come from search(), a Java"
                  + " method"));
    }
    if (io.mateu.uidl.interfaces.CrudStore.class.isAssignableFrom(type) || hasCrudStore(type)) {
      out.add(new Violation(route, simple + " reads and writes through a CrudStore"));
    }
    // (every Listing is an ActionHandler for its own search — judged by the Listing rule above)
    if (io.mateu.uidl.interfaces.ActionHandler.class.isAssignableFrom(type)
        && !io.mateu.uidl.interfaces.Listing.class.isAssignableFrom(type)) {
      out.add(new Violation(route, simple + " handles actions in Java (ActionHandler)"));
    }
    for (Method method : type.getMethods()) {
      if (method.getDeclaringClass() == Object.class) {
        continue;
      }
      if (isActionMethod(method) && !hasAnnotation(method, RestAction.class)) {
        out.add(
            new Violation(
                route,
                simple
                    + "."
                    + method.getName()
                    + "() is a Java action method (add @RestAction to run it in the browser)"));
      }
    }
    return out;
  }

  private static boolean hasCrudStore(Class<?> type) {
    for (var method : type.getMethods()) {
      if (method.getParameterCount() == 0
          && io.mateu.uidl.interfaces.CrudStore.class.isAssignableFrom(method.getReturnType())) {
        return true;
      }
    }
    return false;
  }

  private static boolean isActionMethod(Method method) {
    for (Annotation a : method.getAnnotations()) {
      if (ACTION_ANNOTATIONS.contains(a.annotationType().getName())) {
        return true;
      }
    }
    return false;
  }

  private static boolean hasAnnotation(
      java.lang.reflect.AnnotatedElement element, Class<? extends Annotation> type) {
    if (element.isAnnotationPresent(type)) {
      return true;
    }
    // meta-annotations: an annotation whose type carries the one we look for
    for (Annotation a : element.getAnnotations()) {
      if (a.annotationType().isAnnotationPresent(type)) {
        return true;
      }
    }
    return false;
  }

  // ── wire and definitions ───────────────────────────────────────────────────────────────────────

  /**
   * Every source the exported wire uses, inline or by reference. The app shell's {@code
   * restSources} (the whole catalogue, shipped once) is skipped: an entry nobody uses needs no
   * server.
   */
  static List<Violation> checkWire(String route, JsonNode wire, RestSourceCatalog catalog) {
    var out = new ArrayList<Violation>();
    walk(
        wire,
        (key, node) -> {
          if ("restSources".equals(key)) {
            return false;
          }
          if (looksLikeSource(node)) {
            out.addAll(checkSource(route, node, catalog, "a source"));
          }
          out.addAll(checkTriggers(route, node));
          return true;
        });
    return out;
  }

  /**
   * A trigger fires by itself — on load, on success, on a value change — so it is the one action
   * nobody has to click for a static page to call a server. Each one must run an action the BROWSER
   * can complete (one with a {@code restAction}).
   */
  private static List<Violation> checkTriggers(String route, JsonNode component) {
    var out = new ArrayList<Violation>();
    var triggers = component.path("triggers");
    if (!triggers.isArray() || triggers.isEmpty()) {
      return out;
    }
    var restActions = new java.util.HashSet<String>();
    for (var action : component.path("actions")) {
      if (action.hasNonNull("restAction")) {
        restActions.add(action.path("id").asText());
      }
    }
    for (var trigger : triggers) {
      var actionId = trigger.path("actionId").asText("");
      if (!actionId.isBlank() && !restActions.contains(actionId)) {
        out.add(
            new Violation(
                route,
                "its "
                    + trigger.path("type").asText("trigger")
                    + " trigger runs action '"
                    + actionId
                    + "' on the server"));
      }
    }
    return out;
  }

  static List<Violation> checkDefinition(String route, JsonNode def, RestSourceCatalog catalog) {
    var out = new ArrayList<Violation>();
    Set<String> restActions = new java.util.HashSet<>();
    for (var action : def.path("actions")) {
      if (action.has("restAction")) {
        restActions.add(action.path("id").asText());
      }
    }
    walk(
        def,
        (key, node) -> {
          if (looksLikeSource(node)) {
            out.addAll(checkSource(route, node, catalog, "a source"));
          }
          if ("Button".equals(node.path("type").asText())
              && node.hasNonNull("actionId")
              && !node.has("actionable")
              && !node.hasNonNull("route")
              && !restActions.contains(node.path("actionId").asText())) {
            out.add(
                new Violation(
                    route,
                    "button '"
                        + node.path("actionId").asText()
                        + "' has neither a route nor a restAction in `actions:`, so it would be"
                        + " dispatched to a server"));
          }
          // any other component that names an action — a map's markerActionId, a board's
          // moveActionId, a tile's actionId — dispatches it to a server just the same (triggers are
          // checked on their own, see checkTriggers)
          var type = node.path("type").asText("");
          if (!type.isBlank() && !"Button".equals(type) && !"triggers".equals(key)) {
            node.fields()
                .forEachRemaining(
                    field -> {
                      var name = field.getKey();
                      var id = field.getValue().isTextual() ? field.getValue().asText() : "";
                      if ((name.equals("actionId") || name.endsWith("ActionId"))
                          && !id.isBlank()
                          && !restActions.contains(id)) {
                        out.add(
                            new Violation(
                                route,
                                type
                                    + " runs action '"
                                    + id
                                    + "' ("
                                    + name
                                    + ") with no restAction in `actions:`, so it would be"
                                    + " dispatched to a server"));
                      }
                    });
          }
          return true;
        });
    return out;
  }

  private static boolean looksLikeSource(JsonNode node) {
    return node.isObject() && (node.has("url") || node.has("ref") || node.has("proxy"));
  }

  /** One source: by reference (resolved against the catalogue) or inline. */
  static List<Violation> checkSource(
      String route, JsonNode source, RestSourceCatalog catalog, String what) {
    var out = new ArrayList<Violation>();
    var ref = source.path("ref").asText("");
    if (!ref.isBlank()) {
      var entry = find(catalog, ref);
      if (entry != null && entry.source() != null) {
        var resolved = entry.source();
        // a surface may set proxy itself on top of the entry
        boolean proxy = resolved.proxy() || source.path("proxy").asBoolean(false);
        out.addAll(
            verdict(
                route,
                "source '" + ref + "'",
                proxy,
                resolved.url(),
                resolved.headers(),
                resolved.body()));
      }
    }
    if (source.has("url") && !source.path("url").asText("").isBlank()) {
      out.addAll(
          verdict(
              route,
              what + " (" + source.path("url").asText() + ")",
              source.path("proxy").asBoolean(false),
              source.path("url").asText(),
              source.has("headers") ? MAPPER.convertValue(source.get("headers"), Map.class) : null,
              source.path("body").asText("")));
    } else if (ref.isBlank() && source.path("proxy").asBoolean(false)) {
      out.add(new Violation(route, what + " is fetched through the server proxy (proxy: true)"));
    }
    return out;
  }

  private static List<Violation> verdict(
      String route, String what, boolean proxy, String url, Map<?, ?> headers, String body) {
    if (proxy) {
      return List.of(
          new Violation(
              route, what + " is fetched through the server proxy (proxy: true) — there is none"));
    }
    var text = (url == null ? "" : url) + " " + (headers == null ? "" : headers) + " " + body;
    if (text.contains("${secret.")) {
      return List.of(
          new Violation(
              route,
              what
                  + " is DIRECT but uses ${secret.…}: the browser has no secret scope, and a secret"
                  + " in a static file is not a secret"));
    }
    return List.of();
  }

  private static RestSourceEntry find(RestSourceCatalog catalog, String name) {
    for (var entry : catalog.sources()) {
      if (name.equals(entry.name())) {
        return entry;
      }
    }
    return null;
  }

  /** Visits every object node with the key it hangs from; the visitor returns false to prune. */
  private static void walk(JsonNode node, java.util.function.BiPredicate<String, JsonNode> visit) {
    walk(null, node, visit);
  }

  private static void walk(
      String key, JsonNode node, java.util.function.BiPredicate<String, JsonNode> visit) {
    if (node == null) {
      return;
    }
    if (node.isObject()) {
      if (!visit.test(key, node)) {
        return;
      }
      node.fields().forEachRemaining(e -> walk(e.getKey(), e.getValue(), visit));
    } else if (node.isArray()) {
      for (var child : node) {
        walk(key, child, visit);
      }
    }
  }

  private StaticSafetyCheck() {}
}
