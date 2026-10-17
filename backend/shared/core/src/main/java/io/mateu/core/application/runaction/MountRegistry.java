package io.mateu.core.application.runaction;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

/**
 * Discovers the mounts of a deployment: the data-driven counterpart of scanning for {@code @UI}
 * classes. A <b>mount</b> is a UI application served at a base path — the same thing
 * {@code @UI("/back-office")} declares — but authored as a file:
 *
 * <pre>{@code
 * # back-office.ui.yaml
 * type: UI
 * basePath: /back-office
 * home: orders            # optional: the route of this mount that is its home page
 * routes:                 # a LIST of route files, merged (last wins) into this mount's registry
 *   - orders-routes.yaml
 *   - shared-routes.yaml
 * }</pre>
 *
 * <p>{@code home} names a route of the mount (relative to it, as in its route files). Without an
 * app shell the mount root renders that route when no route {@code ""} is authored (an authored
 * {@code ""} always wins); an app shell bound to {@code ""} that declares no {@code homeRoute:}
 * lands on it. A {@code home} that names no route is warned about and ignored. See {@link
 * RouteRegistry#authoredFrom} and {@link RouteRegistry#mountHomeFor}.
 *
 * <p>Mounts are found by SCANNING the classpath under {@code specs/ui/**} for files carrying {@code
 * type: UI} (by content, not by filename), so several UIs can coexist. A route file with no mount
 * pointing at it is not loaded — declaring the mount is what serves it.
 */
@Slf4j
public final class MountRegistry {

  static final String ROOT = "specs/ui";

  /**
   * A discovered mount: its base path, the ordered route files that make up its registry, its
   * optional {@code home} route (relative to the mount, slashes trimmed; {@code null} when not
   * declared) and the resource the descriptor was read from (for diagnostics; may be null).
   */
  public record Mount(String basePath, List<String> routeFiles, String home, String descriptor) {
    public Mount {
      basePath = normalizeBasePath(basePath);
      routeFiles = routeFiles == null ? List.of() : List.copyOf(routeFiles);
      home = home == null || home.isBlank() ? null : normalizeBasePath(home);
    }

    public Mount(String basePath, List<String> routeFiles) {
      this(basePath, routeFiles, null, null);
    }
  }

  /**
   * A standalone {@code type: Routes} file that tags itself with the mount it belongs to. Unlike a
   * {@link Mount} descriptor (which merely LISTS route files to load), such a file IS the route
   * content and carries its own optional {@code basePath} — so a class-declared
   * {@code @UI("/shop")} mount can author its inner routes without a separate {@code type: UI}
   * descriptor.
   */
  public record RouteFileMount(String basePath, String resourcePath) {
    public RouteFileMount {
      basePath = normalizeBasePath(basePath);
    }
  }

  /** All mounts declared as {@code type: UI} files on the classpath, in discovery order. */
  public List<Mount> mounts(ClassLoader classLoader) {
    var cl =
        io.mateu.core.infra.dev.DevSpecs.classLoader(
            classLoader == null ? MountRegistry.class.getClassLoader() : classLoader);
    var mounts = new ArrayList<Mount>();
    var index = SpecsIndex.of(cl);
    for (var resourcePath : index.paths()) {
      var mount = readMount(index, resourcePath);
      if (mount != null) {
        mounts.add(mount);
      }
    }
    if (!mounts.isEmpty()) {
      log.info(
          "Discovered {} mount(s): {}",
          mounts.size(),
          mounts.stream().map(Mount::basePath).collect(Collectors.joining(", ")));
    }
    return mounts;
  }

  /**
   * All standalone {@code type: Routes} files on the classpath, each with its declared {@code
   * basePath} (default {@code ""}). These are the route files that tag themselves with a mount
   * rather than being listed by a {@code type: UI} descriptor.
   */
  public List<RouteFileMount> routeFileMounts(ClassLoader classLoader) {
    var cl =
        io.mateu.core.infra.dev.DevSpecs.classLoader(
            classLoader == null ? MountRegistry.class.getClassLoader() : classLoader);
    var found = new ArrayList<RouteFileMount>();
    var index = SpecsIndex.of(cl);
    for (var resourcePath : index.paths()) {
      try {
        var root = index.tree(resourcePath);
        if (root == null || !root.isObject() || !"Routes".equals(text(root, "type"))) {
          continue;
        }
        found.add(new RouteFileMount(text(root, "basePath"), resourcePath));
      } catch (Exception e) {
        log.warn("Failed to read route file {}: {}", resourcePath, e.getMessage());
      }
    }
    return found;
  }

  /**
   * Every {@code type: Project} descriptor under {@code specs/ui/**}, as resource paths, in
   * discovery order. There should be one ({@code specs/ui/project.yaml}); the caller decides what
   * to do with more.
   */
  public List<String> projectDescriptors(ClassLoader classLoader) {
    var cl = classLoader == null ? MountRegistry.class.getClassLoader() : classLoader;
    var found = new ArrayList<String>();
    var index = SpecsIndex.of(cl);
    for (var resourcePath : index.paths()) {
      try {
        var root = index.tree(resourcePath);
        if (root != null
            && root.isObject()
            && io.mateu.uidl.data.ProjectSettings.TYPE.equals(text(root, "type"))) {
          found.add(resourcePath);
        }
      } catch (Exception e) {
        // not a YAML this scan can read — some other file's business
      }
    }
    return found;
  }

  /** Reads one resource; returns a Mount only when it carries {@code type: UI}. */
  private Mount readMount(SpecsIndex index, String resourcePath) {
    try {
      var root = index.tree(resourcePath);
      if (root == null || !root.isObject() || !"UI".equals(text(root, "type"))) {
        return null;
      }
      var basePath = text(root, "basePath");
      var routeFiles = new ArrayList<String>();
      var routes = root.get("routes");
      if (routes != null && routes.isArray()) {
        routes.forEach(n -> routeFiles.add(n.asText()));
      } else if (routes != null && routes.isTextual()) {
        routeFiles.add(routes.asText());
      }
      return new Mount(basePath, routeFiles, text(root, "home"), resourcePath);
    } catch (Exception e) {
      log.warn("Failed to read mount descriptor {}: {}", resourcePath, e.getMessage());
      return null;
    }
  }

  /**
   * Every {@code *.yaml}/{@code *.yml} resource path under {@code specs/ui/} (recursive), across
   * the classpath — for the other file kinds discovered by their {@code type:} ({@code
   * Translations}, {@code Environment}).
   */
  public static Set<String> yamlResourcePaths(ClassLoader cl) {
    return scanYamlResourcePaths(cl);
  }

  /**
   * Every {@code *.yaml}/{@code *.yml} resource path under {@code specs/ui/} (recursive), from the
   * {@link SpecsIndex} (one walk per classloader).
   */
  static Set<String> scanYamlResourcePaths(ClassLoader cl) {
    return SpecsIndex.of(cl).paths();
  }

  private static String text(com.fasterxml.jackson.databind.JsonNode node, String field) {
    return node.hasNonNull(field) ? node.get(field).asText() : null;
  }

  /** A base path is stored without leading/trailing slashes, so it composes as a route prefix. */
  static String normalizeBasePath(String basePath) {
    return io.mateu.core.infra.Slashes.trim(basePath);
  }
}
