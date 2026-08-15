package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.io.File;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.jar.JarFile;
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
 * routes:                 # a LIST of route files, merged (last wins) into this mount's registry
 *   - orders-routes.yaml
 *   - shared-routes.yaml
 * }</pre>
 *
 * <p>Mounts are found by SCANNING the classpath under {@code specs/ui/**} for files carrying {@code
 * type: UI} (by content, not by filename), so several UIs can coexist. A route file with no mount
 * pointing at it is not loaded — declaring the mount is what serves it.
 */
@Slf4j
public final class MountRegistry {

  static final String ROOT = "specs/ui";

  /** A discovered mount: its base path and the ordered route files that make up its registry. */
  public record Mount(String basePath, List<String> routeFiles) {
    public Mount {
      basePath = normalizeBasePath(basePath);
      routeFiles = routeFiles == null ? List.of() : List.copyOf(routeFiles);
    }
  }

  private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());

  /** All mounts declared as {@code type: UI} files on the classpath, in discovery order. */
  public List<Mount> mounts(ClassLoader classLoader) {
    var cl = classLoader == null ? MountRegistry.class.getClassLoader() : classLoader;
    var mounts = new ArrayList<Mount>();
    for (var resourcePath : scanYamlResourcePaths(cl)) {
      var mount = readMount(cl, resourcePath);
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

  /** Reads one resource; returns a Mount only when it carries {@code type: UI}. */
  private Mount readMount(ClassLoader cl, String resourcePath) {
    try (InputStream is = cl.getResourceAsStream(resourcePath)) {
      if (is == null) {
        return null;
      }
      var root = yaml.readTree(is);
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
      return new Mount(basePath, routeFiles);
    } catch (Exception e) {
      log.warn("Failed to read mount descriptor {}: {}", resourcePath, e.getMessage());
      return null;
    }
  }

  /** Every {@code *.yaml}/{@code *.yml} resource path under {@code specs/ui/} (recursive). */
  private Set<String> scanYamlResourcePaths(ClassLoader cl) {
    var paths = new LinkedHashSet<String>();
    try {
      var urls = cl.getResources(ROOT);
      while (urls.hasMoreElements()) {
        var url = urls.nextElement();
        switch (url.getProtocol()) {
          case "file" -> scanDir(new File(url.toURI()), ROOT, paths);
          case "jar" -> scanJar(url, paths);
          default -> {}
        }
      }
    } catch (Exception e) {
      log.warn("Failed to scan {} for mounts: {}", ROOT, e.getMessage());
    }
    return paths;
  }

  private static void scanDir(File dir, String resourcePrefix, Set<String> out) {
    var children = dir.listFiles();
    if (children == null) {
      return;
    }
    for (var child : children) {
      var childPath = resourcePrefix + "/" + child.getName();
      if (child.isDirectory()) {
        scanDir(child, childPath, out);
      } else if (isYaml(child.getName())) {
        out.add(childPath);
      }
    }
  }

  private static void scanJar(java.net.URL url, Set<String> out) throws Exception {
    var connection = (JarURLConnection) url.openConnection();
    try (JarFile jar = connection.getJarFile()) {
      var prefix = ROOT + "/";
      jar.stream()
          .map(java.util.jar.JarEntry::getName)
          .filter(name -> name.startsWith(prefix) && isYaml(name))
          .forEach(out::add);
    }
  }

  private static boolean isYaml(String name) {
    return name.endsWith(".yaml") || name.endsWith(".yml");
  }

  private static String text(com.fasterxml.jackson.databind.JsonNode node, String field) {
    return node.hasNonNull(field) ? node.get(field).asText() : null;
  }

  /** A base path is stored without leading/trailing slashes, so it composes as a route prefix. */
  static String normalizeBasePath(String basePath) {
    return basePath == null ? "" : basePath.replaceAll("^/+", "").replaceAll("/+$", "");
  }
}
