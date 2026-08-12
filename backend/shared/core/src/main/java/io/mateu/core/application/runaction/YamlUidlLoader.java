package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.fluent.Component;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Loads a page defined in a YAML file under {@code specs/ui/} on the classpath.
 *
 * <p>Two shapes are supported:
 *
 * <ul>
 *   <li><b>Bare layout</b> (legacy): the whole file is a component tree ({@code type: ...}). It
 *       renders as a static, unbound page — good for help/landing screens with no behaviour.
 *   <li><b>Page envelope</b>: a {@code layout:} key holds the component tree and an optional {@code
 *       modelView:} key names a Java class. When present, that class is instantiated as the page's
 *       ModelView — it supplies the state, actions, validations and rules — while the YAML supplies
 *       the layout. This is the inverse of {@code @UISpec} (there the class points at the YAML;
 *       here the YAML points at the class), so a page can be authored as a file that references a
 *       plain, unannotated logic class.
 * </ul>
 *
 * The binding between the YAML layout and the ModelView is by convention, exactly as everywhere
 * else in Mateu: a {@code FormField id="name"} binds to the ModelView's {@code name} property and a
 * {@code Button actionId="save"} to its {@code save()} method.
 */
@Slf4j
@Named
@Singleton
public class YamlUidlLoader {

  /** A parsed page spec: the layout, plus the ModelView class name when the YAML declares one. */
  /**
   * A parsed page spec.
   *
   * @param layout an explicit layout — a SNAPSHOT, which takes the screen out of inference for good
   * @param delta what a human changed about the INFERRED layout. The two are alternatives: a delta
   *     lets the screen keep re-deriving, so a field the model grows later still appears. See
   *     {@link io.mateu.uidl.data.LayoutDelta}.
   */
  public record YamlPageSpec(
      String modelView, Component layout, io.mateu.uidl.data.LayoutDelta delta) {

    public YamlPageSpec(String modelView, Component layout) {
      this(modelView, layout, io.mateu.uidl.data.LayoutDelta.empty());
    }
  }

  // Specs are static files, so parse once and cache by (normalized) route. A miss is cached as
  // NONE so an unmatched route — checked on every request that has no Java class — doesn't hit the
  // classpath each time. (Editing a YAML during development needs a restart to be picked up.)
  private static final YamlPageSpec NONE = new YamlPageSpec(null, null);

  private final ObjectMapper mapper;
  private final ConcurrentHashMap<String, YamlPageSpec> byRoute = new ConcurrentHashMap<>();

  /**
   * The mount's route registry. When a route's entry names a {@code definition}, THAT file is the
   * layout — instead of the {@code specs/ui/<route>.yaml} convention, which ties a screen's layout
   * to its URL and so prevents one definition from serving several routes.
   */
  private final RouteRegistry routeRegistry;

  @jakarta.inject.Inject
  public YamlUidlLoader(RouteRegistry routeRegistry) {
    this.mapper = YamlUidlMapperFactory.create();
    this.routeRegistry = routeRegistry;
  }

  /** Without a registry: the convention alone, as before it existed. */
  public YamlUidlLoader() {
    this(new RouteRegistry());
  }

  /**
   * Parse a YAML page from raw TEXT (not the classpath) into its layout component — the
   * live-preview path for the visual builder, which sends the editor's current, unsaved content.
   * Envelope-aware: unwraps {@code layout:} when present, else treats the whole doc as the layout.
   * Null on blank/invalid input.
   */
  public Component parseText(String yaml) {
    if (yaml == null || yaml.isBlank()) {
      return null;
    }
    try {
      return layoutOf(mapper.readTree(yaml));
    } catch (Exception e) {
      log.warn("Failed to parse YAML preview: {}", e.getMessage());
      return null;
    }
  }

  /** Load a layout from an explicit spec path (the {@code @UISpec} path); envelope-aware. */
  public Component loadFromSpec(String specPath) {
    var resource = resolve(specPath);
    if (resource == null) {
      log.warn("No YAML spec found at classpath:{}", specPath);
      return null;
    }
    try (var is = resource) {
      return layoutOf(mapper.readTree(is));
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", specPath, e.getMessage());
      return null;
    }
  }

  /**
   * The parsed spec for a route ({@code specs/ui/<route>.yaml}), or {@code null} when there is
   * none.
   */
  public YamlPageSpec loadSpec(String route) {
    var spec = byRoute.computeIfAbsent(normalize(route), this::parseSpec);
    return spec == NONE ? null : spec;
  }

  /**
   * The YAML layout for {@code route}, but only when the route's spec declares {@code modelView}
   * and it matches {@code modelViewClass} — i.e. this instance IS the page's declared ModelView.
   * This is what re-applies the YAML layout on an action round-trip (which routes by
   * serverSideType), not just on the first load. Returns {@code null} otherwise.
   */
  public Component layoutForRoute(String route, Class<?> modelViewClass) {
    var spec = loadSpec(route);
    if (spec == null || spec.modelView() == null || modelViewClass == null) {
      return null;
    }
    return spec.modelView().equals(modelViewClass.getName()) ? spec.layout() : null;
  }

  private YamlPageSpec parseSpec(String normalizedRoute) {
    var entry = routeRegistry.authored().match(normalizedRoute).map(match -> match.entry());
    var declaredDefinition =
        entry.map(io.mateu.uidl.data.RouteEntry::definition).filter(d -> !d.isBlank()).orElse(null);
    var yamlPath =
        declaredDefinition != null
            ? definitionPath(declaredDefinition)
            : "specs/ui/" + normalizedRoute + ".yaml";
    var resource = resolve(yamlPath);
    if (resource == null) {
      log.info("No YAML spec found at {}", yamlPath);
      return NONE;
    }
    try (var is = resource) {
      var root = mapper.readTree(is);
      if (root == null) {
        return NONE;
      }
      // The definition is layout; the binding to a view model belongs to the route entry. A YAML
      // that still declares `modelView:` keeps working and wins, so nothing that exists today
      // changes — but a definition shared by several routes must NOT name one, or it could only
      // ever serve the class it names.
      var modelView = root.hasNonNull("modelView") ? root.get("modelView").asText() : null;
      if (modelView == null) {
        modelView =
            entry
                .map(io.mateu.uidl.data.RouteEntry::viewModel)
                .filter(viewModel -> !viewModel.isBlank())
                .orElse(null);
      }
      var layout = layoutOf(root);
      var delta = deltaOf(root);
      if (layout == null && delta.isEmpty()) {
        return NONE; // neither a layout nor a delta: nothing this file can contribute
      }
      log.info(
          "Loaded YAML spec {} (modelView={}, {})",
          yamlPath,
          modelView,
          delta.isEmpty() ? "explicit layout" : "layout delta");
      return new YamlPageSpec(modelView, layout, delta);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", yamlPath, e.getMessage());
      return NONE;
    }
  }

  /**
   * Where a declared {@code definition} lives. Relative to {@code specs/ui/} — where the
   * definitions and the {@code routes.yaml} that routes to them sit together — unless it starts
   * with a slash, which addresses the classpath root.
   */
  private static String definitionPath(String definition) {
    return definition.startsWith("/") ? definition.substring(1) : "specs/ui/" + definition;
  }

  /**
   * The {@code layoutDelta:} of a page, or an empty one.
   *
   * <p>The alternative to {@code layout:}: instead of freezing what the screen looked like, it
   * records what a human decided about it — anchored to field ids, so inference keeps running and a
   * field the model grows later still appears.
   */
  private io.mateu.uidl.data.LayoutDelta deltaOf(JsonNode root) {
    var node = root == null ? null : root.get("layoutDelta");
    if (node == null || !node.isObject()) {
      return io.mateu.uidl.data.LayoutDelta.empty();
    }
    var order = new java.util.ArrayList<String>();
    if (node.has("order") && node.get("order").isArray()) {
      node.get("order").forEach(n -> order.add(n.asText()));
    }
    var hidden = new java.util.ArrayList<String>();
    if (node.has("hidden") && node.get("hidden").isArray()) {
      node.get("hidden").forEach(n -> hidden.add(n.asText()));
    }
    var overrides =
        new java.util.LinkedHashMap<String, io.mateu.uidl.data.LayoutDelta.FieldOverride>();
    if (node.has("overrides") && node.get("overrides").isObject()) {
      node.get("overrides")
          .fields()
          .forEachRemaining(
              entry -> {
                var value = entry.getValue();
                overrides.put(
                    entry.getKey(),
                    new io.mateu.uidl.data.LayoutDelta.FieldOverride(
                        value.hasNonNull("label") ? value.get("label").asText() : null,
                        value.hasNonNull("colspan") ? value.get("colspan").asInt() : null,
                        value.hasNonNull("section") ? value.get("section").asText() : null));
              });
    }
    return new io.mateu.uidl.data.LayoutDelta(order, hidden, overrides);
  }

  /**
   * The component tree of a parsed doc: the {@code layout:} node in an envelope, else the whole
   * doc.
   */
  private Component layoutOf(JsonNode root) throws Exception {
    if (root == null) {
      return null;
    }
    // A page that carries a `layoutDelta:` and no `layout:` has NO explicit layout on purpose —
    // that is the whole point of a delta. Falling back to "the whole document is the tree" here
    // would try to parse the delta itself as components and lose the page.
    if (!root.has("layout") && root.has("layoutDelta")) {
      return null;
    }
    var node = root.has("layout") ? root.get("layout") : root;
    return mapper.treeToValue(node, Component.class);
  }

  private InputStream resolve(String path) {
    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl != null ? cl.getResourceAsStream(path) : null;
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(path);
    }
    return resource;
  }

  private String normalize(String route) {
    var r = route == null ? "" : route;
    int idx = r.indexOf('?');
    if (idx >= 0) {
      r = r.substring(0, idx);
    }
    while (r.startsWith("/")) {
      r = r.substring(1);
    }
    return r;
  }
}
