package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.application.runaction.MountRegistry.Mount;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
   * The authored half: every mount's route files, grouped by base path, merged (last wins) and
   * prefixed with the base path into absolute routes. Three producers feed it, all keyed by base
   * path so they compose:
   *
   * <ol>
   *   <li><b>{@code type: UI} mounts</b> — a descriptor listing the route files of its base path.
   *   <li><b>standalone {@code type: Routes} files</b> — a route file that tags itself with a
   *       {@code basePath}, so a class-declared {@code @UI("/shop")} mount authors its inner routes
   *       with no separate descriptor. This is the common case now that inner routes are data, not
   *       annotations.
   *   <li><b>the conventional {@code specs/ui/routes.yaml}</b> at the root — kept for back-compat
   *       when nothing else declares a mount.
   * </ol>
   *
   * <p>A declared base path is validated against the known mounts ({@code type: UI} + the
   * {@code @UI} classes in the derived index); an unknown one is logged loudly rather than silently
   * prefixing routes onto a mount that does not exist. Never fails — a broken file logs and yields
   * fewer routes, not an outage.
   */
  public RouteTable authoredFrom(ClassLoader classLoader) {
    var cl = classLoader == null ? RouteRegistry.class.getClassLoader() : classLoader;
    var discovered = mountRegistry.mounts(cl);
    this.mounts = discovered;

    // base path -> relative entries, last write winning on a route collision.
    var byBasePath = new LinkedHashMap<String, LinkedHashMap<String, RouteEntry>>();
    var consumed = new LinkedHashSet<String>();

    // 1. type: UI descriptors — their listed route files.
    for (var mount : discovered) {
      var bucket = byBasePath.computeIfAbsent(mount.basePath(), key -> new LinkedHashMap<>());
      for (var routeFile : mount.routeFiles()) {
        var resourcePath = resolveRouteFilePath(routeFile);
        consumed.add(resourcePath);
        for (var entry : readRouteEntries(cl, resourcePath)) {
          bucket.put(entry.route(), entry);
        }
      }
    }

    // 2. Standalone type: Routes files tagging themselves with a base path.
    for (var routeFile : mountRegistry.routeFileMounts(cl)) {
      if (!consumed.add(routeFile.resourcePath())) {
        continue; // already loaded as part of a type: UI mount, or seen twice
      }
      var bucket = byBasePath.computeIfAbsent(routeFile.basePath(), key -> new LinkedHashMap<>());
      for (var entry : readRouteEntries(cl, routeFile.resourcePath())) {
        bucket.put(entry.route(), entry);
      }
    }

    // 3. The conventional root routes.yaml, only when no mount already covers it (back-compat).
    if (discovered.isEmpty() && consumed.add(CONVENTIONAL_ROUTES)) {
      var conventional = readRouteEntries(cl, CONVENTIONAL_ROUTES);
      if (!conventional.isEmpty()) {
        var bucket = byBasePath.computeIfAbsent("", key -> new LinkedHashMap<>());
        for (var entry : conventional) {
          bucket.putIfAbsent(entry.route(), entry);
        }
      }
    }

    validateBasePaths(cl, byBasePath.keySet(), discovered);

    var entries = new ArrayList<RouteEntry>();
    byBasePath.forEach(
        (basePath, bucket) ->
            bucket
                .values()
                .forEach(
                    entry ->
                        entries.add(
                            withRoute(
                                entry,
                                prefix(basePath, entry.route()),
                                entry.hasParent() ? prefix(basePath, entry.parent()) : null))));
    return new RouteTable(entries);
  }

  /**
   * Warns when a route file declares a {@code basePath} that matches no known mount — a {@code
   * type: UI} descriptor or a {@code @UI} class. The routes are still applied (they resolve as
   * absolute paths regardless), but the mismatch is almost always a typo against the owning
   * {@code @UI}, so it is named with both the declared value and what is available.
   */
  private void validateBasePaths(ClassLoader cl, Set<String> declared, List<Mount> discovered) {
    var known = new LinkedHashSet<String>();
    known.add("");
    for (var mount : discovered) {
      known.add(mount.basePath());
    }
    for (var entry : derivedFrom(cl).routes()) {
      known.add(normalize(entry.route()));
    }
    if (known.size() == 1) {
      // Only the root is known: there is no annotation index and no descriptor to validate
      // against (a unit test or a static bundle), so a mismatch cannot be told from a valid mount.
      return;
    }
    for (var basePath : declared) {
      if (!known.contains(basePath)) {
        log.error(
            "Route file declares basePath '{}', which matches no @UI mount. Known mounts: {}. The"
                + " routes are applied as-is, but this is almost certainly a typo against the owning"
                + " @UI base path.",
            basePath,
            known);
      }
    }
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
        flattenNode(node, null, "", entries);
      }
      return entries;
    } catch (Exception e) {
      log.warn("Failed to read route file {}: {}", resourcePath, e.getMessage());
      return List.of();
    }
  }

  /**
   * Flattens one authored node and its nested {@code children} into flat entries. A child's route
   * is composed RELATIVE to its parent ({@code orders} under {@code use-cases/rra} becomes {@code
   * use-cases/rra/orders}) and carries the parent's route as {@link RouteEntry#parent}, so the
   * sub-route renders into the parent screen's slot instead of replacing the page. Routes are still
   * relative to the mount here; the base path is applied afterwards.
   */
  private void flattenNode(
      com.fasterxml.jackson.databind.JsonNode node,
      String parentRoute,
      String prefix,
      List<RouteEntry> out) {
    var relative = normalize(node.hasNonNull("route") ? node.get("route").asText() : "");
    var full = prefix.isEmpty() ? relative : relative.isEmpty() ? prefix : prefix + "/" + relative;
    out.add(
        new RouteEntry(
            full,
            node.hasNonNull("definition") ? node.get("definition").asText() : null,
            node.hasNonNull("viewModel") ? node.get("viewModel").asText() : null,
            paramsOf(node, "fixedParams"),
            paramsOf(node, "defaultParams"),
            parentRoute,
            null,
            paramsOf(node, "state"),
            paramsOf(node, "appState"),
            dataSourceOf(node, "data"),
            dataSourceOf(node, "appData")));
    var childrenNode = node.get("children");
    if (childrenNode != null && childrenNode.isArray()) {
      for (var child : childrenNode) {
        flattenNode(child, full, full, out);
      }
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

  private static RouteEntry withRoute(RouteEntry entry, String route, String parent) {
    return new RouteEntry(
        route,
        entry.definition(),
        entry.viewModel(),
        entry.fixedParams(),
        entry.defaultParams(),
        parent,
        entry.children(),
        entry.state(),
        entry.appState(),
        entry.data(),
        entry.appData());
  }

  /**
   * Parses a {@code data}/{@code appData} node into a {@link RestDataSource}. A bare string is the
   * {@code data: countries} shorthand (a reference by name); an object may also carry inline
   * endpoint fields.
   */
  private static RestDataSource dataSourceOf(
      com.fasterxml.jackson.databind.JsonNode node, String field) {
    if (!node.hasNonNull(field)) {
      return null;
    }
    var n = node.get(field);
    if (n.isTextual()) {
      return RestDataSource.ref(n.asText());
    }
    if (n.isObject()) {
      return new RestDataSource(
          n.hasNonNull("ref") ? n.get("ref").asText() : null,
          n.hasNonNull("url") ? n.get("url").asText() : null,
          n.hasNonNull("method") ? n.get("method").asText() : null,
          null,
          n.hasNonNull("body") ? n.get("body").asText() : null,
          n.hasNonNull("itemsPath") ? n.get("itemsPath").asText() : null,
          n.hasNonNull("valuePath") ? n.get("valuePath").asText() : null,
          n.hasNonNull("labelPath") ? n.get("labelPath").asText() : null,
          n.hasNonNull("proxy") && n.get("proxy").asBoolean());
    }
    return null;
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
