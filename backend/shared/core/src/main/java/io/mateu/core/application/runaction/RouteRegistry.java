package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * The mount's route registry: what each URL resolves to.
 *
 * <p>Two producers feed one table. The <b>derived</b> half comes from the annotation processors'
 * indexes ({@code META-INF/mateu/ui-registrations} + {@code route-registrations}), so every
 * {@code @UI}/{@code @Route} class keeps working untouched. The <b>authored</b> half is {@code
 * specs/ui/routes.yaml}, sitting next to the definitions it routes to. The authored entry wins —
 * explicit beats derived, the same precedence the layout and page inference already use.
 *
 * <p>Why the authored half exists at all: an annotation can only say "this class is at this path",
 * which is the one-to-one case. A registry entry binds a route to a <em>definition</em>, a <em>view
 * model</em> and <em>parameters</em> independently, so the same screen can answer several routes
 * with different parameters pinned, and a route can exist with no server class behind it at all —
 * which is what a fully static deployment is.
 */
@Slf4j
@Named
@Singleton
public class RouteRegistry {

  /** The authored table, next to the definitions it routes to. */
  static final String ROUTES_YAML = "specs/ui/routes.yaml";

  private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
  private volatile RouteTable table;
  private volatile RouteTable authored;

  /** The merged table, loaded once. */
  public RouteTable table() {
    var loaded = table;
    if (loaded == null) {
      synchronized (this) {
        loaded = table;
        if (loaded == null) {
          loaded = load(Thread.currentThread().getContextClassLoader());
          table = loaded;
        }
      }
    }
    return loaded;
  }

  /** The entry answering a concrete path, with the path parameters read off it. */
  public Optional<RouteTable.Match> match(String path) {
    return table().match(path);
  }

  /**
   * The authored half alone, cached. Route resolution consults only this one: the derived half is
   * the same information the {@code RoutedClassProvider}s already carry, and they carry it better
   * (they also serve the CRUD sub-routes). The merged {@link #table()} is what the static bundle
   * ships, where there are no providers to ask.
   */
  public RouteTable authored() {
    var loaded = authored;
    if (loaded == null) {
      synchronized (this) {
        loaded = authored;
        if (loaded == null) {
          loaded = authoredFrom(classLoader());
          authored = loaded;
        }
      }
    }
    return loaded;
  }

  private static ClassLoader classLoader() {
    var contextClassLoader = Thread.currentThread().getContextClassLoader();
    return contextClassLoader == null ? RouteRegistry.class.getClassLoader() : contextClassLoader;
  }

  RouteTable load(ClassLoader classLoader) {
    var cl = classLoader == null ? RouteRegistry.class.getClassLoader() : classLoader;
    var derived = derivedFrom(cl);
    var authored = authoredFrom(cl);
    var merged = authored.mergedOver(derived);
    log.info(
        "Route registry: {} entries ({} derived from annotations, {} authored in {})",
        merged.routes().size(),
        derived.routes().size(),
        authored.routes().size(),
        ROUTES_YAML);
    return merged;
  }

  /**
   * The annotation-derived half. The AP indexes already ARE a route table — a route and the class
   * that answers it — so they map straight onto entries with no definition and no parameters.
   */
  RouteTable derivedFrom(ClassLoader classLoader) {
    var entries = new ArrayList<RouteEntry>();
    for (var ref : RouteRegistrations.read(classLoader)) {
      entries.add(RouteEntry.of(normalize(ref.route()), ref.className()));
    }
    return new RouteTable(entries);
  }

  /** The authored half. A missing or unparseable file yields an empty table, never a failure. */
  RouteTable authoredFrom(ClassLoader classLoader) {
    try (InputStream is = classLoader.getResourceAsStream(ROUTES_YAML)) {
      if (is == null) {
        return RouteTable.empty();
      }
      var root = yaml.readTree(is);
      if (root == null) {
        return RouteTable.empty();
      }
      // Both shapes are accepted: a bare list of entries, or a `routes:` envelope.
      var routesNode = root.has("routes") ? root.get("routes") : root;
      if (!routesNode.isArray()) {
        log.warn("{} has no routes list; ignoring it", ROUTES_YAML);
        return RouteTable.empty();
      }
      var entries = new ArrayList<RouteEntry>();
      for (var node : routesNode) {
        entries.add(
            new RouteEntry(
                normalize(node.hasNonNull("route") ? node.get("route").asText() : ""),
                node.hasNonNull("definition") ? node.get("definition").asText() : null,
                node.hasNonNull("viewModel") ? node.get("viewModel").asText() : null,
                paramsOf(node, "fixedParams"),
                paramsOf(node, "defaultParams")));
      }
      return new RouteTable(entries);
    } catch (Exception e) {
      // A broken routes.yaml must not take the app down: the annotation-derived routes still work,
      // and the failure is loud in the log rather than fatal at boot.
      log.warn("Failed to read {}: {}", ROUTES_YAML, e.getMessage());
      return RouteTable.empty();
    }
  }

  private Map<String, Object> paramsOf(com.fasterxml.jackson.databind.JsonNode node, String field) {
    if (!node.hasNonNull(field) || !node.get(field).isObject()) {
      return Map.of();
    }
    var params = new LinkedHashMap<String, Object>();
    node.get(field)
        .fields()
        .forEachRemaining(
            entry -> params.put(entry.getKey(), yaml.convertValue(entry.getValue(), Object.class)));
    return params;
  }

  /** Routes are relative to the mount, so a leading or trailing slash carries no meaning. */
  private static String normalize(String route) {
    return route == null ? "" : route.replaceAll("^/+", "").replaceAll("/+$", "");
  }
}
