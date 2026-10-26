package io.mateu.maven.bundle;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.RouteRegistrations;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.MobileManifest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The UI manifest of a static bundle — what a Mateu server answers at {@code
 * <baseUrl>/mateu/v3/manifest} ({@link MobileManifest}: name, icon, colour, wire and minimum app
 * versions), written as a FILE at that same path inside the bundle, so the Mateu mobile app reads a
 * static UI exactly as it reads a served one, from any static host. It is built by the servers' own
 * code from the same declarations — the mount's {@code type: AppShell} (title, logo, accent colour)
 * or the root {@code @UI} class — and {@code mateu.mobile.*} settings apply at build time.
 *
 * <p>One member more than a server's: {@code "bundle": "manifest.json"}, the bundle manifest the
 * app runs from instead of calling {@code /mateu/v3/sync} (there is nothing to call).
 */
final class MobileManifestFile {

  /** Where the file goes, relative to the bundle directory. */
  static final String PATH = MobileManifest.PATH_SUFFIX.substring(1);

  /** The bundle manifest the app runs from, relative to the UI's base URL. */
  static final String BUNDLE = "manifest.json";

  private static final ObjectMapper MAPPER = new ObjectMapper();

  private MobileManifestFile() {}

  /**
   * The manifest JSON of the bundled app: its root mount's YAML app shell, else its root
   * {@code @UI} class, else just the page title.
   */
  static String json(ClassLoader appLoader, List<RouteRegistrations.RouteRef> routes, String title)
      throws IOException {
    var previous = Thread.currentThread().getContextClassLoader();
    Thread.currentThread().setContextClassLoader(appLoader);
    try {
      String served = null;
      var definition = new RouteRegistry().rootDefinitionFor("");
      var shell = definition == null ? null : new YamlAppLoader().load(definition);
      if (shell != null) {
        served = MobileManifest.json(shell);
      } else {
        var root =
            routes.stream()
                .filter(r -> r.route() == null || r.route().isEmpty() || "/".equals(r.route()))
                .map(RouteRegistrations.RouteRef::className)
                .findFirst();
        if (root.isPresent()) {
          served = MobileManifest.json(root.get());
        }
      }
      Map<String, Object> manifest =
          served != null
              ? MAPPER.readValue(served, new TypeReference<LinkedHashMap<String, Object>>() {})
              : MobileManifest.build(
                  new MobileManifest.Source(
                      title == null || title.isBlank() ? "Mateu" : title, null, null, null, null));
      manifest.put("bundle", BUNDLE);
      return MAPPER.writeValueAsString(manifest);
    } finally {
      Thread.currentThread().setContextClassLoader(previous);
    }
  }

  /** Writes {@code json} to {@code <bundle>/mateu/v3/manifest}. */
  static void write(Path bundle, String json) throws IOException {
    var file = bundle.resolve(PATH);
    Files.createDirectories(file.getParent());
    Files.writeString(file, json);
  }
}
