package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.application.runaction.MountRegistry.Mount;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * The route registry, aggregated across the deployment's mounts.
 *
 * <p>Two producers feed one table. The <b>derived</b> half comes from the annotation processors'
 * indexes, so every {@code @UI}/{@code @Route} class keeps working untouched. The <b>authored</b>
 * half is data: each mount (a {@code type: UI} file — see {@link MountRegistry}) lists one or more
 * route files, merged into that mount's registry (on a route collision the <b>last file wins</b>).
 * Routes are RELATIVE to the mount; this registry flattens them to ABSOLUTE routes by prefixing
 * each with the mount's {@code basePath}, so resolution against a request URL is unchanged.
 * Authored wins over derived, the same precedence the layout and page inference use.
 *
 * <p>When no {@code type: UI} file is present the conventional single mount at the root is used: a
 * {@code specs/ui/routes.yaml} loaded at base path {@code ""}. (There is no longer an {@code app:}
 * block — the app is its own {@code type: AppShell} definition bound to a route.)
 */
@Slf4j
@Named
@Singleton
public class RouteRegistry {

  /**
   * The conventional route file of the implicit root mount, used when no {@code type: UI} exists.
   */
  static final String CONVENTIONAL_ROUTES = "specs/ui/routes.yaml";

  private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
  private final MountRegistry mountRegistry = new MountRegistry();

  private volatile RouteTable table;
  private volatile RouteTable authored;
  private volatile List<Mount> mounts;

  /** The merged table (authored over derived), loaded once. */
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
   * The authored half alone (absolute routes across all mounts), cached. Route resolution consults
   * only this one: the derived half is what the {@code RoutedClassProvider}s already carry, and
   * they carry it better (they also serve the CRUD sub-routes). The merged {@link #table()} is what
   * the static bundle ships, where there are no providers to ask.
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

  /** The discovered mounts (base paths + route files). Loaded together with {@link #authored()}. */
  public List<Mount> mounts() {
    authored(); // ensures the scan ran and populated `mounts`
    var loaded = mounts;
    return loaded == null ? List.of() : loaded;
  }

  /**
   * The definition bound to the ROOT route ({@code ""}) of the mount that owns {@code route}, or
   * {@code null}. This is where a mount's app shell lives: a root entry whose {@code definition} is
   * a {@code type: AppShell} file. Used to render the shell for any route under the mount.
   */
  public String rootDefinitionFor(String route) {
    var normalized = normalize(route);
    Mount best = null;
    for (var mount : mounts()) {
      var basePath = mount.basePath();
      var owns =
          basePath.isEmpty()
              || normalized.equals(basePath)
              || normalized.startsWith(basePath + "/");
      if (owns && (best == null || basePath.length() > best.basePath().length())) {
        best = mount;
      }
    }
    if (best == null) {
      return null;
    }
    return authored()
        .match(best.basePath())
        .map(match -> match.entry().definition())
        .filter(definition -> definition != null && !definition.isBlank())
        .orElse(null);
  }

  /** Whether {@code route} is the ROOT of some mount (its {@code basePath}). */
  public boolean isMountRoot(String route) {
    var normalized = normalize(route);
    return mounts().stream().anyMatch(mount -> mount.basePath().equals(normalized));
  }

  private static ClassLoader classLoader() {
    var contextClassLoader = Thread.currentThread().getContextClassLoader();
    return contextClassLoader == null ? RouteRegistry.class.getClassLoader() : contextClassLoader;
  }

  RouteTable load(ClassLoader classLoader) {
    var cl = classLoader == null ? RouteRegistry.class.getClassLoader() : classLoader;
    var derived = derivedFrom(cl);
    var authoredTable = authoredFrom(cl);
    var merged = authoredTable.mergedOver(derived);
    log.info(
        "Route registry: {} entries ({} derived from annotations, {} authored across {} mount(s))",
        merged.routes().size(),
        derived.routes().size(),
        authoredTable.routes().size(),
        mounts == null ? 0 : mounts.size());
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

  /**
   * The authored half: every mount's route files, merged (last wins) and prefixed with the mount's
   * base path into absolute routes. Falls back to the conventional {@code specs/ui/routes.yaml} at
   * the root when no {@code type: UI} mount is declared. Never fails — a broken file logs and
   * yields fewer routes, not an outage.
   */
  public RouteTable authoredFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? RouteRegistry.class.getClassLoader() : classLoader;
    var discovered = mountRegistry.mounts(cl);
    this.mounts = discovered;
    if (discovered.isEmpty()) {
      // The conventional single root mount: a route file at base path "".
      return new RouteTable(readRouteEntries(cl, CONVENTIONAL_ROUTES));
    }
    var entries = new ArrayList<RouteEntry>();
    for (var mount : discovered) {
      var byRoute = new LinkedHashMap<String, RouteEntry>();
      for (var routeFile : mount.routeFiles()) {
        for (var entry : readRouteEntries(cl, resolveRouteFilePath(routeFile))) {
          byRoute.put(entry.route(), entry); // last file wins on a route collision
        }
      }
      for (var entry : byRoute.values()) {
        entries.add(withRoute(entry, prefix(mount.basePath(), entry.route())));
      }
    }
    return new RouteTable(entries);
  }

  /** Reads a route file (a {@code routes:} envelope or a bare list) into relative-route entries. */
  private List<RouteEntry> readRouteEntries(ClassLoader classLoader, String resourcePath) {
    try (InputStream is = classLoader.getResourceAsStream(resourcePath)) {
      if (is == null) {
        return List.of();
      }
      var root = yaml.readTree(is);
      if (root == null) {
        return List.of();
      }
      var routesNode = root.has("routes") ? root.get("routes") : root;
      if (!routesNode.isArray()) {
        return List.of();
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
      return entries;
    } catch (Exception e) {
      log.warn("Failed to read route file {}: {}", resourcePath, e.getMessage());
      return List.of();
    }
  }

  /**
   * A route file is referenced relative to {@code specs/ui/}, or classpath-absolute with a slash.
   */
  private static String resolveRouteFilePath(String routeFile) {
    return routeFile.startsWith("/") ? routeFile.substring(1) : "specs/ui/" + routeFile;
  }

  /**
   * Prefix a relative route with the mount base path: {@code (back-office, orders) →
   * back-office/orders}.
   */
  private static String prefix(String basePath, String route) {
    if (basePath == null || basePath.isEmpty()) {
      return route;
    }
    return route == null || route.isEmpty() ? basePath : basePath + "/" + route;
  }

  private static RouteEntry withRoute(RouteEntry entry, String route) {
    return new RouteEntry(
        route, entry.definition(), entry.viewModel(), entry.fixedParams(), entry.defaultParams());
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
