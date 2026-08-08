package io.mateu.maven.bundle;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reads the routes an app declares from the framework's compiled indexes ({@code
 * META-INF/mateu/ui-registrations} + {@code route-registrations}) — the same files the annotation
 * processors write. Each file is `---`-separated blocks of {@code key=value} lines; from a UI block
 * we take {@code class}+{@code path}, from a route block {@code class}+each {@code routes} value
 * ({@code value|parentRoute|uis}, entries joined by {@code ;}). De-duped by route, first wins.
 */
final class RouteRegistrationReader {

  record RouteEntry(String route, String className) {}

  static List<RouteEntry> read(ClassLoader cl) throws IOException {
    var byRoute = new LinkedHashMap<String, RouteEntry>();
    readResource(cl, "META-INF/mateu/ui-registrations", byRoute, true);
    readResource(cl, "META-INF/mateu/route-registrations", byRoute, false);
    return new ArrayList<>(byRoute.values());
  }

  private static void readResource(
      ClassLoader cl, String path, Map<String, RouteEntry> out, boolean ui) throws IOException {
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
            out.putIfAbsent(p, new RouteEntry(p, cls));
          }
        } else {
          var routes = kv.get("routes");
          if (routes != null && !routes.isBlank()) {
            for (String entry : routes.split(";")) {
              var value = entry.split("\\|", -1)[0];
              if (value != null && !value.isBlank()) {
                out.putIfAbsent(value, new RouteEntry(value, cls));
              }
            }
          }
        }
      }
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

  private RouteRegistrationReader() {}
}
