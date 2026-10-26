package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.BundleManifest;
import io.mateu.core.application.export.MateuBundleExporter;
import io.mateu.core.infra.IndexPage;
import io.mateu.core.infra.MobileManifest;
import io.mateu.core.infra.Pwa;
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
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
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

  /** The service worker, at the bundle's root so a static host needs no header for its scope. */
  static final String WORKER = "mateu-sw.js";

  /** The folder of the installable app's other files (manifest, registration script, icons). */
  static final String PWA_DIR = "pwa/";

  /**
   * Whether the bundle is an installable Progressive Web App, and what its app shell declares
   * (name, theme colour, icon). See {@link Pwa}.
   */
  record PwaOptions(boolean enabled, MobileManifest.Source shell) {
    static final PwaOptions ON = new PwaOptions(true, null);
  }

  static final String REDWOOD_MARKER = "_redwood/app-flow.json";

  /** Where a renderer's static app comes from: a directory or a jar on the app classpath. */
  interface StaticApp {
    String index() throws IOException;

    /** Copies everything but the {@code _index.html} template into {@code out}. */
    void copyTo(Path out) throws IOException;

    boolean isRedwood() throws IOException;
  }

  /**
   * As {@link #write(Path, BundleManifest, String, ClassLoader, String, String, ProjectRenderer)}
   * for the Vaadin renderer.
   */
  static void write(
      Path outputDirectory,
      BundleManifest manifest,
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
      BundleManifest manifest,
      String assetsFrom,
      ClassLoader appLoader,
      String baseUrl,
      String pageTitle,
      ProjectRenderer renderer)
      throws IOException {
    write(
        outputDirectory,
        manifest,
        assetsFrom,
        appLoader,
        baseUrl,
        pageTitle,
        renderer,
        PwaOptions.ON);
  }

  /**
   * @param pwa whether (and as what) the bundle is an installable app
   */
  static void write(
      Path outputDirectory,
      BundleManifest manifest,
      String assetsFrom,
      ClassLoader appLoader,
      String baseUrl,
      String pageTitle,
      ProjectRenderer renderer,
      PwaOptions pwa)
      throws IOException {
    Files.createDirectories(outputDirectory);

    // 1. manifest.json — the primary contract the client's bundle mode reads.
    var manifestJson = MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(manifest);
    Files.writeString(outputDirectory.resolve("manifest.json"), manifestJson);

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
    var index = stampIndex(app.index(), baseUrl, pageTitle);

    // 4b. the installable app: manifest, worker, registration script, icons (Pwa).
    index =
        writePwa(outputDirectory, index, baseUrl, manifestJson, pwa == null ? PwaOptions.ON : pwa);
    Files.writeString(outputDirectory.resolve("index.html"), index);

    // 5. SPA fallback for static hosts (client-side routing).
    Files.writeString(outputDirectory.resolve("_redirects"), "/*    /index.html    200\n");
  }

  /**
   * Writes the installable app's files and returns {@code index} with its head. Off, only the
   * worker is written — the one that unregisters itself — and the page is left as it was.
   */
  static String writePwa(
      Path out, String index, String baseUrl, String manifestJson, PwaOptions pwa)
      throws IOException {
    if (!pwa.enabled()) {
      Files.write(out.resolve(WORKER), Pwa.resource(Pwa.WORKER_OFF));
      return index;
    }
    var base = basePathOf(baseUrl);
    var scope = base + "/";
    var dir = out.resolve(PWA_DIR);
    Files.createDirectories(dir);
    Files.writeString(dir.resolve(Pwa.MANIFEST), Pwa.manifestJson(pwa.shell(), scope, scope));
    for (var file : List.of(Pwa.REGISTER, Pwa.ICON_192, Pwa.ICON_512, Pwa.ICON_MASKABLE)) {
      Files.write(dir.resolve(file), Pwa.resource(file));
    }
    Files.write(out.resolve(WORKER), Pwa.resource(Pwa.WORKER));
    var links =
        new Pwa.Links(
            base + "/" + PWA_DIR + Pwa.MANIFEST,
            base + "/" + WORKER,
            base + "/" + PWA_DIR + Pwa.REGISTER,
            base + "/" + PWA_DIR + Pwa.ICON_192,
            scope,
            List.of(base + "/manifest.json"));
    // the worker's version: the page and the bundle's content (a new build, a new worker)
    return Pwa.withHead(index, links, pwa.shell(), sha256(manifestJson));
  }

  /**
   * The path the bundle is served under: {@code ""} for a host's root, {@code /app} for {@code
   * baseUrl} {@code /app} or {@code https://cdn.example.com/app/}.
   */
  static String basePathOf(String baseUrl) {
    if (baseUrl == null || baseUrl.isBlank()) {
      return "";
    }
    var path = baseUrl.trim();
    if (!path.startsWith("/")) {
      try {
        path = java.net.URI.create(path).getPath();
      } catch (IllegalArgumentException e) {
        return "";
      }
      if (path == null) {
        return "";
      }
    }
    while (path.endsWith("/")) {
      path = path.substring(0, path.length() - 1);
    }
    return path.startsWith("/") || path.isEmpty() ? path : "/" + path;
  }

  private static String sha256(String text) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)))
          .substring(0, 16);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
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
    html = html.replace("<!-- AQUIFAVICON -->", IndexPage.DEFAULT_FAVICON);
    // no template marker is left in the published page
    // a mirror of Oracle's CDN (mateu.oracle-cdn.url at build time) replaces it in the page
    return io.mateu.core.infra.OracleCdn.apply(
        IndexPage.withoutMarkers(IndexPage.mountUi(html, ui)));
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
