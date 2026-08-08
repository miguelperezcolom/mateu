package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.export.MateuBundleExporter;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

/**
 * Writes the static bundle to disk: {@code manifest.json} (the pre-rendered increments), the
 * renderer {@code assets/} (copied from the Vaadin renderer resources), a static {@code index.html}
 * (the {@code _index.html} template with its markers stamped to boot {@code <mateu-ui
 * bundleUrl=…>}), and a {@code _redirects} SPA fallback. The output directory is a self-contained
 * static site.
 */
final class BundleWriter {

  private static final ObjectMapper MAPPER = MateuBundleExporter.defaultWireMapper();

  /**
   * @param assetsFrom directory that contains {@code _index.html} + {@code assets/} (null →
   *     auto-resolve from the {@code static/_index.html} resource on the app classloader)
   */
  static void write(
      Path outputDirectory,
      MateuBundleExporter.BundleManifest manifest,
      String assetsFrom,
      ClassLoader appLoader,
      String baseUrl,
      String pageTitle)
      throws IOException {
    Files.createDirectories(outputDirectory);

    // 1. manifest.json — the primary contract the client's bundle mode reads.
    Files.writeString(
        outputDirectory.resolve("manifest.json"),
        MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(manifest));

    // 2. locate the renderer static dir (contains _index.html + assets/).
    Path staticDir = resolveStaticDir(assetsFrom, appLoader);
    if (staticDir == null) {
      throw new IOException(
          "Could not locate the renderer assets. Set <assetsFrom> to a directory containing "
              + "_index.html and assets/ (e.g. the vaadin-lit static resources).");
    }

    // 3. copy assets/.
    Path assetsSrc = staticDir.resolve("assets");
    if (Files.isDirectory(assetsSrc)) {
      copyTree(assetsSrc, outputDirectory.resolve("assets"));
    }

    // 4. stamp index.html from _index.html.
    Path template = staticDir.resolve("_index.html");
    if (Files.isRegularFile(template)) {
      Files.writeString(
          outputDirectory.resolve("index.html"),
          stampIndex(Files.readString(template), baseUrl, pageTitle));
    }

    // 5. SPA fallback for static hosts (client-side routing).
    Files.writeString(outputDirectory.resolve("_redirects"), "/*    /index.html    200\n");
  }

  private static Path resolveStaticDir(String assetsFrom, ClassLoader appLoader) {
    if (assetsFrom != null && !assetsFrom.isBlank()) {
      return Path.of(assetsFrom);
    }
    URL res = appLoader.getResource("static/_index.html");
    if (res != null && "file".equals(res.getProtocol())) {
      return Path.of(java.net.URI.create(res.toString())).getParent();
    }
    return null; // inside a jar — caller must set assetsFrom
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
    int a = html.indexOf("<!-- AQUIUI -->");
    int b = html.indexOf("<!-- HASTAAQUIUI -->");
    if (a >= 0 && b > a) {
      html = html.substring(0, a) + "<!-- AQUIUI -->\n  " + ui + "\n  " + html.substring(b);
    }
    return html;
  }

  private static void copyTree(Path src, Path dest) throws IOException {
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
                Files.copy(p, target, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
              }
            } catch (IOException e) {
              throw new UncheckedIOException(e);
            }
          });
    }
  }

  private BundleWriter() {}
}
