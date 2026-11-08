package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.JarURLConnection;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;

/**
 * Figma → specs/ui YAML in one step:
 *
 * <pre>
 * mvn io.mateu:mateu-bundle-maven-plugin:figma -Dfigma.file=&lt;url-or-key&gt;
 *     [-Dfigma.frames=a,b] [-Dfigma.out=src/main/resources/specs/ui] [-Dfigma.dryRun]
 * </pre>
 *
 * <p>Fetches the file through the Figma REST API, converts every screen frame designed with the
 * Mateu library with the converter in {@code design/figma/to-yaml} (bundled in this jar and run
 * with {@code node} ≥ 20 — never a second implementation of it), writes the pages and registers
 * each new one in the mount's routes.yaml with a minimal text append ({@code # __ROUTES__} marks
 * where, else the end of the list; a route already declared is left alone). The converter's
 * warnings are printed as they come.
 *
 * <p>The token comes from {@code FIGMA_TOKEN}, else {@code ~/.mateu-secrets/figma-token}, else
 * {@code ~/.config/mateu/figma-token}; it is handed to node through its environment and never
 * logged. {@code -Dfigma.json=<file>} reads a payload already downloaded instead (no token, no
 * network).
 */
@Mojo(name = "figma", requiresProject = false, threadSafe = true)
public class FigmaMojo extends AbstractMojo {

  static final String BUNDLE = "META-INF/mateu/figma-import/";

  /** The Figma file: its URL (as copied from the browser) or its key. */
  @Parameter(property = "figma.file")
  String file;

  /** A Figma REST payload on disk ({@code GET /v1/files/:key}), instead of {@code figma.file}. */
  @Parameter(property = "figma.json")
  File json;

  /** Only these frames (names or slugs, comma-separated); all of them when absent. */
  @Parameter(property = "figma.frames")
  String frames;

  /** Where the pages go: the mount's specs/ui folder (or a folder under it). */
  @Parameter(property = "figma.out", defaultValue = "${basedir}/src/main/resources/specs/ui")
  File out;

  /** Report what would be written and registered, write nothing. */
  @Parameter(property = "figma.dryRun", defaultValue = "false")
  boolean dryRun;

  /** Overwrite existing files that were not generated from Figma (they are skipped otherwise). */
  @Parameter(property = "figma.force", defaultValue = "false")
  boolean force;

  /** Register the new pages in routes.yaml. */
  @Parameter(property = "figma.routes", defaultValue = "true")
  boolean routes;

  /** The node executable; found on PATH (and the usual install folders) when absent. */
  @Parameter(property = "figma.node")
  String node;

  /** The Figma API base url (tests point it at a local server). */
  @Parameter(property = "figma.api", defaultValue = "https://api.figma.com")
  String api;

  Map<String, String> environment = System.getenv();
  Path home = Path.of(System.getProperty("user.home"));

  /** What the last run did — the summary, for tests. */
  final List<String> written = new ArrayList<>();

  final List<String> routesAdded = new ArrayList<>();
  final List<String> warnings = new ArrayList<>();

  @Override
  public void execute() throws MojoExecutionException, MojoFailureException {
    if ((file == null || file.isBlank()) == (json == null))
      throw new MojoFailureException(
          "Say which Figma file to import: -Dfigma.file=<the file's URL or key>"
              + " (or -Dfigma.json=<a downloaded payload>).");
    var args = new ArrayList<String>();
    var env = new HashMap<String, String>();
    if (json != null) {
      if (!json.isFile()) throw new MojoFailureException("figma.json: " + json + " does not exist");
      args.addAll(List.of("--json", json.getAbsolutePath()));
    } else {
      String key;
      try {
        key = FigmaImport.fileKey(file);
      } catch (IllegalArgumentException e) {
        throw new MojoFailureException(e.getMessage());
      }
      var token =
          FigmaImport.token(environment, home)
              .orElseThrow(
                  () -> new MojoFailureException("No Figma token. " + FigmaImport.TOKEN_HELP));
      env.put("FIGMA_TOKEN", token);
      args.addAll(List.of("--key", key, "--api", api));
    }
    var outDir = out.toPath().toAbsolutePath().normalize();
    args.addAll(List.of("--out", outDir.toString(), "--report", "json"));
    if (frames != null && !frames.isBlank()) args.addAll(List.of("--frames", frames));
    if (dryRun) args.add("--dry-run");
    if (force) args.add("--force");

    var nodeExe = findNode();
    JsonNode report;
    Path bundle = null;
    try {
      bundle = extractBundle();
      report =
          new ObjectMapper()
              .readTree(run(nodeExe, bundle.resolve("import/figma-import.mjs"), args, env));
      if (report == null || !report.isObject())
        throw new MojoFailureException("The Figma import answered no report.");
    } catch (IOException e) {
      throw new MojoExecutionException("Figma import failed: " + e.getMessage(), e);
    } finally {
      deleteTree(bundle);
    }

    var log = getLog();
    for (var f : report.path("files")) {
      var line =
          (dryRun && !"unchanged".equals(f.path("status").asText()) ? "would be " : "")
              + f.path("status").asText()
              + " "
              + f.path("path").asText()
              + "  ← \""
              + f.path("frame").asText()
              + "\"";
      log.info(line);
      written.add(f.path("status").asText() + " " + f.path("path").asText());
    }
    for (var w : report.path("warnings")) {
      warnings.add(w.asText());
      log.warn(w.asText());
    }
    if (routes) registerRoutes(report, outDir);

    var counts = new HashMap<String, Integer>();
    for (var f : report.path("files")) counts.merge(f.path("status").asText(), 1, Integer::sum);
    log.info(
        (dryRun ? "Dry run — nothing written. " : "")
            + counts.getOrDefault("created", 0)
            + " created, "
            + counts.getOrDefault("updated", 0)
            + " updated, "
            + counts.getOrDefault("unchanged", 0)
            + " unchanged"
            + (counts.containsKey("skipped") ? ", " + counts.get("skipped") + " skipped" : "")
            + "; "
            + routesAdded.size()
            + " route(s) "
            + (dryRun ? "to add" : "added")
            + (routesAdded.isEmpty() ? "" : " (" + String.join(", ", routesAdded) + ")")
            + "; "
            + warnings.size()
            + " warning(s).");
  }

  private void registerRoutes(JsonNode report, Path outDir) throws MojoExecutionException {
    var root = FigmaImport.specsRoot(outDir);
    var prefix = root.relativize(outDir).toString().replace('\\', '/');
    try {
      var routesFiles = new ArrayList<String>();
      if (Files.isDirectory(root)) {
        try (Stream<Path> walk = Files.walk(root)) {
          for (var p : walk.filter(p -> p.toString().matches(".*\\.ya?ml$")).toList())
            if (FigmaImport.isRoutesFile(Files.readString(p)))
              routesFiles.add(root.relativize(p).toString().replace('\\', '/'));
        }
      }
      var chosen = FigmaImport.routesFileFor(routesFiles);
      var routesPath = root.resolve(chosen.orElse("routes.yaml"));
      var text = chosen.isPresent() ? Files.readString(routesPath) : FigmaImport.routesFileText();
      var original = text;
      for (var f : report.path("files")) {
        if (f.path("partial").asBoolean()
            || "AppShell".equals(f.path("type").asText())
            || "skipped".equals(f.path("status").asText())) continue;
        var layout =
            prefix.isEmpty() ? f.path("path").asText() : prefix + "/" + f.path("path").asText();
        var route = FigmaImport.routeOfPage(layout);
        var next = FigmaImport.appendImportedRoute(text, route, layout);
        if (next.isPresent()) {
          text = next.get();
          routesAdded.add(route);
        }
      }
      if (!dryRun && !text.equals(original)) {
        Files.createDirectories(routesPath.getParent());
        Files.writeString(routesPath, text);
        getLog().info((chosen.isPresent() ? "updated " : "created ") + root.relativize(routesPath));
      }
    } catch (IOException | IllegalArgumentException e) {
      throw new MojoExecutionException("Could not register the routes: " + e.getMessage(), e);
    }
  }

  private Path findNode() throws MojoFailureException {
    String seen = null;
    for (var candidate : FigmaImport.nodeCandidates(node, environment, home)) {
      if (!Files.isExecutable(candidate)) continue;
      try {
        var p =
            new ProcessBuilder(candidate.toString(), "--version").redirectErrorStream(true).start();
        var version = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
        if (!p.waitFor(20, TimeUnit.SECONDS)) p.destroyForcibly();
        var major = FigmaImport.nodeMajor(version);
        if (major.isPresent() && major.get() >= FigmaImport.MIN_NODE_MAJOR) return candidate;
        seen = candidate + " is " + version;
      } catch (IOException e) {
        // not runnable: try the next one
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        break;
      }
    }
    throw new MojoFailureException(
        "Importing from Figma needs Node.js "
            + FigmaImport.MIN_NODE_MAJOR
            + " or newer"
            + (seen == null ? ", and none was found on the PATH" : " (" + seen + ")")
            + ". Install it from https://nodejs.org or point -Dfigma.node=<path to node> at one.");
  }

  private String run(Path nodeExe, Path script, List<String> args, Map<String, String> env)
      throws IOException, MojoFailureException {
    var cmd = new ArrayList<String>();
    cmd.add(nodeExe.toString());
    cmd.add(script.toString());
    cmd.addAll(args);
    var pb = new ProcessBuilder(cmd);
    pb.environment().putAll(env);
    var err = Files.createTempFile("mateu-figma", ".err");
    pb.redirectError(err.toFile());
    try {
      var p = pb.start();
      var stdout = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
      if (!p.waitFor(10, TimeUnit.MINUTES)) {
        p.destroyForcibly();
        throw new MojoFailureException("The Figma import did not finish in 10 minutes.");
      }
      var stderr = Files.readString(err).trim();
      if (p.exitValue() != 0)
        throw new MojoFailureException(
            stderr.isEmpty() ? "The Figma import failed (exit " + p.exitValue() + ")." : stderr);
      return stdout;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new MojoFailureException("Interrupted");
    } finally {
      Files.deleteIfExists(err);
    }
  }

  private static void deleteTree(Path dir) {
    if (dir == null) return;
    // never follows links: Files.walk does not, and only regular files/dirs are deleted
    try (Stream<Path> walk = Files.walk(dir)) {
      for (var p : walk.sorted(java.util.Comparator.reverseOrder()).toList())
        Files.deleteIfExists(p);
    } catch (IOException e) {
      // a temp folder left behind is harmless
    }
  }

  /** Copies the bundled converter out of the plugin jar (or classes dir) into a temp folder. */
  Path extractBundle() throws IOException {
    var marker = getClass().getClassLoader().getResource(BUNDLE + "import/figma-import.mjs");
    if (marker == null)
      throw new IOException("the converter is not bundled in this plugin (" + BUNDLE + ")");
    var target = Files.createTempDirectory("mateu-figma-import");
    if ("jar".equals(marker.getProtocol())) {
      var conn = (JarURLConnection) marker.openConnection();
      conn.setUseCaches(false);
      try (var jar = conn.getJarFile()) {
        for (var entries = jar.entries(); entries.hasMoreElements(); ) {
          var e = entries.nextElement();
          if (e.isDirectory() || !e.getName().startsWith(BUNDLE)) continue;
          var dest = target.resolve(e.getName().substring(BUNDLE.length())).normalize();
          if (!dest.startsWith(target)) continue;
          Files.createDirectories(dest.getParent());
          try (InputStream in = jar.getInputStream(e)) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
          }
        }
      }
    } else {
      Path base;
      try {
        base = Path.of(marker.toURI()).getParent().getParent();
      } catch (URISyntaxException e) {
        throw new IOException(e);
      }
      try (Stream<Path> walk = Files.walk(base)) {
        for (var p : walk.filter(Files::isRegularFile).toList()) {
          var dest = target.resolve(base.relativize(p).toString());
          Files.createDirectories(dest.getParent());
          Files.copy(p, dest, StandardCopyOption.REPLACE_EXISTING);
        }
      }
    }
    return target;
  }
}
