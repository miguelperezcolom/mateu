package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.core.infra.IndexPage;
import io.mateu.uidl.data.ProjectRenderer;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.JarURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.jar.JarFile;
import java.util.stream.Stream;

/**
 * Writes the static bundle to disk: {@code manifest.json} (the pre-rendered increments), the
 * renderer's static app (everything its jar ships under {@code static/} — Vaadin's {@code assets/},
 * Redwood's {@code _redwood/} Visual Builder app), a static {@code index.html} (the {@code
 * _index.html} template with its markers stamped to boot {@code <mateu-ui bundleUrl=…>}), and a
 * {@code _redirects} SPA fallback. The output directory is a self-contained static site.
 *
 * <p>WHICH renderer is the project's choice ({@code specs/ui/project.yaml}, see {@link
 * io.mateu.uidl.data.ProjectSettings}); its static app is taken from the renderer jar on the app's
 * classpath — a directory or, the common case, the jar itself — or from {@code <assetsFrom>}.
 */
final class BundleWriter {

  private static final ObjectMapper MAPPER = MateuBundleExporter.defaultWireMapper();

  static final String INDEX = "static/_index.html";
  static final String REDWOOD_MARKER = "_redwood/app-flow.json";

  /** Where a renderer's static app comes from: a directory or a jar on the app classpath. */
  interface StaticApp {
    String index() throws IOException;

    /** Copies everything but the {@code _index.html} template into {@code out}. */
    void copyTo(Path out) throws IOException;

    boolean isRedwood() throws IOException;
  }

  /**
   * As {@link #write(Path, MateuBundleExporter.BundleManifest, String, ClassLoader, String, String,
   * ProjectRenderer)} for the Vaadin renderer.
   */
  static void write(
      Path outputDirectory,
      MateuBundleExporter.BundleManifest manifest,
      String assetsFrom,
      ClassLoader appLoader,
      String baseUrl,
      String pageTitle)
      throws IOException {
    write(outputDirectory, manifest, assetsFrom, appLoader, baseUrl, pageTitle, null);
  }

  /**
   * @param assetsFrom directory that contains {@code _index.html} + the renderer's static files
   *     (null → the renderer jar on the app classloader)
   * @param renderer the renderer to bundle; null = whichever the classpath serves
   */
  static void write(
      Path outputDirectory,
      MateuBundleExporter.BundleManifest manifest,
      String assetsFrom,
      ClassLoader appLoader,
      String baseUrl,
      String pageTitle,
      ProjectRenderer renderer)
      throws IOException {
    Files.createDirectories(outputDirectory);

    // 1. manifest.json — the primary contract the client's bundle mode reads.
    Files.writeString(
        outputDirectory.resolve("manifest.json"),
        MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(manifest));

    // 2. locate the renderer's static app.
    StaticApp app = locate(assetsFrom, appLoader, renderer);
    if (app == null) {
      throw new IOException(
          renderer == null
              ? "Could not locate the renderer assets. Set <assetsFrom> to a directory containing"
                  + " _index.html and assets/ (e.g. the vaadin-lit static resources)."
              : "The project's renderer is "
                  + renderer
                  + " but its static app is not on the app's classpath. Add "
                  + renderer.coordinates()
                  + " as a dependency, or set <assetsFrom> to a directory holding its static/"
                  + " folder.");
    }

    // 3. copy the static app (Vaadin: assets/; Redwood: _redwood/ — the whole VB app).
    app.copyTo(outputDirectory);

    // 4. stamp index.html from _index.html.
    Files.writeString(
        outputDirectory.resolve("index.html"), stampIndex(app.index(), baseUrl, pageTitle));

    // 5. SPA fallback for static hosts (client-side routing).
    Files.writeString(outputDirectory.resolve("_redirects"), "/*    /index.html    200\n");
  }

  /** The static app of {@code renderer} (or of whatever is served, when null), or null. */
  static StaticApp locate(String assetsFrom, ClassLoader appLoader, ProjectRenderer renderer)
      throws IOException {
    if (assetsFrom != null && !assetsFrom.isBlank()) {
      return new DirApp(Path.of(assetsFrom));
    }
    var found = appLoader.getResources(INDEX);
    while (found.hasMoreElements()) {
      var app = of(found.nextElement());
      if (app == null) {
        continue;
      }
      if (renderer == null) {
        return app;
      }
      if (app.isRedwood() == (renderer == ProjectRenderer.redwood)) {
        return app;
      }
    }
    return null;
  }

  private static StaticApp of(URL index) {
    try {
      return switch (index.getProtocol()) {
        case "file" -> new DirApp(Path.of(index.toURI()).getParent());
        case "jar" -> new JarApp(index);
        default -> null;
      };
    } catch (Exception e) {
      return null;
    }
  }

  /** A renderer's {@code static/} folder on disk. */
  record DirApp(Path dir) implements StaticApp {
    @Override
    public String index() throws IOException {
      return Files.readString(dir.resolve("_index.html"));
    }

    @Override
    public void copyTo(Path out) throws IOException {
      try (Stream<Path> children = Files.list(dir)) {
        for (Path child : children.toList()) {
          if (child.getFileName().toString().equals("_index.html")) {
            continue;
          }
          copyTree(child, out.resolve(child.getFileName().toString()));
        }
      }
    }

    @Override
    public boolean isRedwood() {
      return Files.isRegularFile(dir.resolve(REDWOOD_MARKER));
    }
  }

  /** A renderer's {@code static/} folder inside its jar ({@code io.mateu:mateu-vaadin} …). */
  record JarApp(URL indexUrl) implements StaticApp {
    private JarFile jar() throws IOException {
      var connection = (JarURLConnection) indexUrl.openConnection();
      connection.setUseCaches(false);
      return connection.getJarFile();
    }

    @Override
    public String index() throws IOException {
      try (InputStream is = indexUrl.openStream()) {
        return new String(is.readAllBytes(), StandardCharsets.UTF_8);
      }
    }

    @Override
    public void copyTo(Path out) throws IOException {
      try (JarFile jar = jar()) {
        for (var entry : jar.stream().toList()) {
          var name = entry.getName();
          if (!name.startsWith("static/") || name.equals(INDEX) || entry.isDirectory()) {
            continue;
          }
          var target = out.resolve(name.substring("static/".length())).normalize();
          if (!target.startsWith(out.normalize())) {
            continue; // a zip-slip entry is nobody's static file
          }
          Files.createDirectories(target.getParent());
          try (InputStream is = jar.getInputStream(entry)) {
            Files.copy(is, target, StandardCopyOption.REPLACE_EXISTING);
          }
        }
      }
    }

    @Override
    public boolean isRedwood() throws IOException {
      try (JarFile jar = jar()) {
        return jar.getEntry("static/" + REDWOOD_MARKER) != null;
      }
    }
  }

  private static String stampIndex(String html, String baseUrl, String pageTitle) {
    html = html.replace("AQUIELTITULODELAPAGINA", pageTitle == null ? "Mateu" : pageTitle);
    var base = baseUrl == null ? "" : baseUrl;
    // Absolute manifest URL (base + /manifest.json): a deep route reached via SPA fallback keeps
    // the
    // document base at that deep path, so a relative "./manifest.json" would 404. Assets in
    // _index.html are already absolute "/assets/…" for the same reason.
    var ui =
        "<mateu-ui baseUrl=\""
            + base
            + "\" bundleUrl=\""
            + base
            + "/manifest.json\" style=\"width:100%;height:100vh;\"></mateu-ui>";
    // The shared mount (core IndexPage) also appends the deferred-boot replayer, so a bundle built
    // with the redwood (Visual Builder) renderer starts too — and shows a fallback page when the
    // Oracle runtime cannot be loaded. The Redwood app reads the bundleUrl off this same element.
    return IndexPage.mountUi(html, ui);
  }

  private static void copyTree(Path src, Path dest) throws IOException {
    if (!Files.isDirectory(src)) {
      Files.createDirectories(dest.getParent());
      Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);
      return;
    }
    Files.createDirectories(dest);
    try (Stream<Path> walk = Files.walk(src)) {
      walk.forEach(
          p -> {
            try {
              Path target = dest.resolve(src.relativize(p).toString());
              if (Files.isDirectory(p)) {
                Files.createDirectories(target);
              } else {
                Files.createDirectories(target.getParent());
                Files.copy(p, target, StandardCopyOption.REPLACE_EXISTING);
              }
            } catch (IOException e) {
              throw new UncheckedIOException(e);
            }
          });
    }
  }

  private BundleWriter() {}
}
