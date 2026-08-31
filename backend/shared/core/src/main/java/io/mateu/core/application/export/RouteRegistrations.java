package io.mateu.core.application.export;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

/**
 * Reads the routes an app declares from the framework's compiled indexes ({@code
 * META-INF/mateu/ui-registrations} + {@code route-registrations} — the files the annotation
 * processors write). Each is `---`-separated blocks of {@code key=value} lines; a UI block yields
 * {@code class}+{@code path}, a route block {@code class}+each {@code routes} value ({@code
 * value|parentRoute|uis}, entries joined by {@code ;}). De-duped by route, first wins. Reused by
 * the static-bundle exporter (build-time Maven goal AND the runtime bundle endpoint).
 */
@Slf4j
public final class RouteRegistrations {

  /** A declared route and the class it resolves to. */
  public record RouteRef(String route, String className) {}

  public static List<RouteRef> read(ClassLoader cl) {
    var byRoute = new LinkedHashMap<String, RouteRef>();
    readResource(cl, "META-INF/mateu/ui-registrations", byRoute, true);
    readResource(cl, "META-INF/mateu/route-registrations", byRoute, false);
    return new ArrayList<>(byRoute.values());
  }

  /** Whether a route can be pre-rendered without a runtime value (no {@code :param} segment). */
  public static boolean isStatic(String route) {
    return route != null && !route.contains(":");
  }

  /**
   * Claims a route for a class, reporting a real COLLISION instead of resolving it silently.
   *
   * <p>First-wins is kept — changing it now would move which class answers a route in apps that
   * already work — but "first" depends on classpath order, which is not stable between builds or
   * between a dev machine and CI. So two jars claiming the same route is a bug that used to resolve
   * differently on different days, with nothing said. Now it is named, with both classes, so it can
   * be fixed rather than discovered.
   *
   * <p>Re-declaring the same route for the same class is not a collision: an app can end up reading
   * the same index twice (a jar present in two classloaders), and that is harmless.
   */
  private static void claim(Map<String, RouteRef> out, String route, String className) {
    var existing = out.get(route);
    if (existing == null) {
      out.put(route, new RouteRef(route, className));
      return;
    }
    if (!existing.className().equals(className)) {
      log.warn(
          "route collision: '{}' is claimed by {} and by {}. Classpath order decides which one"
              + " answers, and that order is not stable — give one of them a different route.",
          route,
          existing.className(),
          className);
    }
  }

  private static void readResource(
      ClassLoader cl, String path, Map<String, RouteRef> out, boolean ui) {
    try {
      var urls = cl.getResources(path);
      while (urls.hasMoreElements()) {
        var url = urls.nextElement();
        String text;
        try (InputStream in = url.openStream()) {
          text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
        for (String block : text.split("(?m)^---\\s*$")) {
          var kv = parseBlock(block);
          var cls = kv.get("class");
          if (cls == null || cls.isBlank()) {
            continue;
          }
          if (ui) {
            var p = kv.get("path");
            if (p != null && !p.isBlank()) {
              claim(out, p, cls);
            }
          } else {
            var routes = kv.get("routes");
            if (routes != null && !routes.isBlank()) {
              for (String entry : routes.split(";")) {
                var value = entry.split("\\|", -1)[0];
                if (value != null && !value.isBlank()) {
                  claim(out, value, cls);
                }
              }
            }
          }
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static Map<String, String> parseBlock(String block) {
    var kv = new LinkedHashMap<String, String>();
    for (String line : block.split("\\R")) {
      int i = line.indexOf('=');
      if (i > 0) {
        kv.put(line.substring(0, i).trim(), line.substring(i + 1));
      }
    }
    return kv;
  }

  private RouteRegistrations() {}
}
