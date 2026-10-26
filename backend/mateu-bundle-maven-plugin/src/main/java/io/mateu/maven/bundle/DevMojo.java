package io.mateu.maven.bundle;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.infra.dev.DevSpecs;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.stream.Stream;
import org.apache.maven.model.Resource;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.Execute;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;

/**
 * {@code mateu-bundle:dev} — develops a static UI: builds the bundle exactly as {@code
 * mateu-bundle:bundle} does (same {@code <configuration>}, same {@code -Dmateu.bundle.*}
 * properties, {@code mateu.bundle.mock} included) into {@code target/mateu-bundle}, serves it on
 * {@code http://localhost:3000} with the SPA fallback a static host gives it, and rebuilds it every
 * time a file under the project's resource directories ({@code specs/ui/**}: definitions, sources
 * and their sample data, translations…) changes. With live reload (on by default) the open pages
 * reload after each successful rebuild.
 *
 * <p>A rebuild that fails — a YAML error, a {@code staticOnly} violation — is logged and the last
 * good bundle keeps being served: each build is written to a staging directory and only replaces
 * the served one when it succeeded. Runs until Ctrl+C.
 *
 * <p>The edited files reach the build the way {@code process-resources} takes them: copied from the
 * resource directories into {@code target/classes} (filtered resource directories are left to Maven
 * and not watched). The goal runs the lifecycle up to {@code process-classes} first, so a project
 * with Java screens is compiled too — but a change to Java code needs a restart.
 */
@Mojo(
    name = "dev",
    requiresDependencyResolution = ResolutionScope.RUNTIME,
    requiresDirectInvocation = true,
    threadSafe = true)
@Execute(phase = LifecyclePhase.PROCESS_CLASSES)
public class DevMojo extends BundleMojo {

  /** Maven's logger configuration for the core's loggers. */
  static final String CORE_LOG_LEVEL = "org.slf4j.simpleLogger.log.io.mateu.core";

  private static final YAMLFactory YAML = new YAMLFactory();

  /** The port to serve on; when it is taken, the next free one is used (and logged). */
  @Parameter(property = "mateu.dev.port", defaultValue = "3000")
  private int port;

  /** The interface to bind: the loopback one by default; {@code 0.0.0.0} to reach it from a LAN. */
  @Parameter(property = "mateu.dev.host", defaultValue = "localhost")
  private String host;

  /**
   * Reload the open pages after every successful rebuild. Off: the bundle is still rebuilt on every
   * change, and a manual refresh shows it.
   */
  @Parameter(property = "mateu.dev.liveReload", defaultValue = "true")
  private boolean liveReload;

  /**
   * Print a QR code on the terminal when serving on the LAN ({@code -Dmateu.dev.host=0.0.0.0}): the
   * link that adds this UI to the Mateu app on a phone (see {@link DevPhone}).
   */
  @Parameter(property = "mateu.dev.qr", defaultValue = "true")
  private boolean qr;

  /**
   * The Expo dev server of a React Native renderer run from source ({@code exp://<lan ip>:8081},
   * what {@code npx expo start} prints): the QR then opens THAT build in Expo Go with this UI,
   * instead of the {@code https://mateu.io/add} link the installed Mateu app answers.
   */
  @Parameter(property = "mateu.dev.expoUrl")
  private String expoUrl;

  /** How often the watched directories are polled for changes, in milliseconds. */
  @Parameter(property = "mateu.dev.pollMillis", defaultValue = "300")
  private long pollMillis;

  private DevServer server;
  private DevWatcher watcher;
  private final CountDownLatch stopped = new CountDownLatch(1);
  private int boundPort;
  private int builds;

  @Override
  public void execute() throws MojoExecutionException, MojoFailureException {
    start();
    var hook = new Thread(this::stop, "mateu-dev-stop");
    Runtime.getRuntime().addShutdownHook(hook);
    try {
      stopped.await();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      stop();
    }
  }

  /** Builds once, starts the server and the watcher; returns at once (the tests drive it). */
  void start() throws MojoExecutionException {
    // the core reports each build's discoveries at INFO: in a rebuild loop that is noise around
    // the one line that matters (unless the developer asked for it: -D…log.io.mateu.core=info)
    if (System.getProperty(CORE_LOG_LEVEL) == null) {
      System.setProperty(CORE_LOG_LEVEL, "warn");
    }
    var output = outputDirectory().toPath();
    sync(sources(), List.of());
    var ok = rebuild();
    if (!ok && Files.isRegularFile(output.resolve("index.html"))) {
      getLog().warn("mateu-dev: serving the bundle that was already in " + output);
    }
    server = new DevServer(output, liveReload, baseUrl());
    try {
      boundPort = server.start(host, port);
    } catch (IOException | RuntimeException e) {
      throw new MojoExecutionException(
          "mateu-dev: cannot serve on " + host + ":" + port + " — " + e.getMessage(), e);
    }
    if (port != 0 && boundPort != port) {
      getLog().warn("mateu-dev: port " + port + " is taken — using " + boundPort);
    }
    var watched = watched();
    watcher = new DevWatcher(watched, pollMillis, this::onChange);
    watcher.start();
    var shown = DevPhone.isWildcard(host) ? "localhost" : host;
    var url = "http://" + shown + ":" + boundPort + DevServer.basePathOf(baseUrl()) + "/";
    getLog()
        .info(
            "mateu-dev: serving "
                + url
                + " (live reload "
                + (liveReload ? "on" : "off — refresh to see a change")
                + "), watching "
                + watched
                + ". Ctrl+C to stop.");
    // the same UI on a phone / simulator, in the Mateu app (the React Native renderer)
    for (var line :
        DevPhone.banner(
            host,
            boundPort,
            DevServer.basePathOf(baseUrl()),
            expoUrl,
            qr,
            DevPhone.isWildcard(host) ? DevPhone.lanAddress() : Optional.empty())) {
      getLog().info(line);
    }
  }

  /** Stops watching and serving. Idempotent. */
  void stop() {
    if (watcher != null) {
      watcher.close();
    }
    if (server != null) {
      server.close();
    }
    stopped.countDown();
  }

  int port() {
    return boundPort;
  }

  DevServer server() {
    return server;
  }

  private void onChange(DevWatcher.Changes changes) {
    try {
      sync(changes.changed(), changes.deleted());
    } catch (RuntimeException e) {
      getLog().error("mateu-dev: could not copy the changed resources: " + e.getMessage());
      return;
    }
    if (rebuild() && server != null) {
      server.reload();
    }
  }

  /**
   * One build into a staging directory, promoted to the served one when it succeeded.
   *
   * @return whether it succeeded
   */
  synchronized boolean rebuild() {
    var output = outputDirectory().toPath();
    var staging = output.resolveSibling(output.getFileName() + ".dev-next");
    var started = System.nanoTime();
    quiet(builds++ > 0);
    // whatever the core cached from the previous build's files is stale now
    DevSpecs.invalidateAll();
    try {
      deleteTree(staging);
      checkYaml();
      bundleInto(staging.toFile());
      promote(staging, output);
      getLog()
          .info(
              "mateu-dev: "
                  + (builds == 1 ? "built" : "rebuilt")
                  + " in "
                  + (System.nanoTime() - started) / 1_000_000
                  + " ms");
      return true;
    } catch (MojoExecutionException | MojoFailureException | IOException | RuntimeException e) {
      var message = describe(e);
      getLog()
          .error(
              "mateu-dev: build failed — "
                  + (Files.isRegularFile(output.resolve("index.html"))
                      ? "still serving the last good bundle"
                      : "nothing to serve yet")
                  + ":\n"
                  + message);
      // clean up BEFORE announcing the failure: whoever reacts to the event sees the final state
      try {
        deleteTree(staging);
      } catch (IOException ignored) {
        // a leftover staging directory is replaced by the next build
      }
      if (server != null) {
        server.failed(message);
      }
      return false;
    }
  }

  private void promote(Path staging, Path output) throws IOException {
    var old = output.resolveSibling(output.getFileName() + ".dev-old");
    deleteTree(old);
    DevServer.IoAction swap =
        () -> {
          if (Files.exists(output)) {
            Files.move(output, old);
          }
          Files.move(staging, output);
        };
    if (server != null) {
      server.swap(swap);
    } else {
      swap.run();
    }
    deleteTree(old);
  }

  /**
   * Fails on a YAML file that does not parse. The build itself only warns about one — it ignores
   * the definition and its route answers "Page not found" — which, in a reload loop, would replace
   * a working screen with a missing one on every half-typed save.
   */
  private void checkYaml() throws MojoFailureException {
    var problems = new ArrayList<String>();
    for (var source : sourceDirs()) {
      for (var file : DevWatcher.snapshot(List.of(source.dir())).keySet()) {
        var name = file.getFileName().toString();
        if (name.endsWith(".yaml") || name.endsWith(".yml")) {
          yamlProblem(file).ifPresent(p -> problems.add(source.dir().relativize(file) + p));
        }
      }
    }
    if (!problems.isEmpty()) {
      throw new MojoFailureException(
          "mateu-bundle: YAML that does not parse:\n  "
              + String.join("\n  ", problems.stream().sorted().toList()));
    }
  }

  static Optional<String> yamlProblem(Path file) {
    try (var parser = YAML.createParser(file.toFile())) {
      while (parser.nextToken() != null) {
        // reading every token is what finds a syntax error
      }
      return Optional.empty();
    } catch (JsonProcessingException e) {
      var location = e.getLocation();
      // snakeyaml's message: context, problem, each followed by an indented excerpt and caret
      var message =
          String.join(
              " — ",
              String.valueOf(e.getOriginalMessage())
                  .lines()
                  .filter(line -> !line.isBlank() && !Character.isWhitespace(line.charAt(0)))
                  .toList());
      return Optional.of(
          (location != null ? ", line " + location.getLineNr() : "") + ": " + message);
    } catch (IOException e) {
      return Optional.empty(); // vanished mid-save: the next poll sees the settled tree
    }
  }

  /** The message of a failed build, down to its root cause. */
  static String describe(Throwable e) {
    var message = new StringBuilder(String.valueOf(e.getMessage()));
    var seen = new ArrayList<Throwable>();
    for (var cause = e.getCause();
        cause != null && !seen.contains(cause);
        cause = cause.getCause()) {
      seen.add(cause);
      if (cause.getMessage() != null && !message.toString().contains(cause.getMessage())) {
        message.append("\n  caused by: ").append(cause.getMessage());
      }
    }
    return message.toString();
  }

  /** The resource directories the build reads, with where Maven copies each of them. */
  private record Source(Path dir, Path target) {}

  private List<Source> sourceDirs() {
    var classes = Path.of(project().getBuild().getOutputDirectory());
    var dirs = new ArrayList<Source>();
    for (Resource resource : project().getResources()) {
      if (resource.isFiltering()) {
        continue;
      }
      var dir = Path.of(resource.getDirectory()).toAbsolutePath().normalize();
      var target =
          resource.getTargetPath() == null ? classes : classes.resolve(resource.getTargetPath());
      dirs.add(new Source(dir, target));
    }
    return dirs;
  }

  /** Every file of every watched resource directory (the first, full copy). */
  private List<Path> sources() {
    return new ArrayList<>(
        DevWatcher.snapshot(sourceDirs().stream().map(Source::dir).toList()).keySet());
  }

  private List<Path> watched() {
    var dirs = new ArrayList<Path>(sourceDirs().stream().map(Source::dir).toList());
    var assets = assetsFrom();
    if (assets != null && !assets.isBlank() && Files.isDirectory(Path.of(assets))) {
      dirs.add(Path.of(assets).toAbsolutePath().normalize());
    }
    return dirs;
  }

  /**
   * Mirrors changed and deleted resource files into the build output, as process-resources would.
   */
  private void sync(List<Path> changed, List<Path> deleted) {
    var dirs = sourceDirs();
    try {
      for (var file : changed) {
        var target = targetOf(dirs, file);
        if (target != null && Files.isRegularFile(file)) {
          Files.createDirectories(target.getParent());
          Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
        }
      }
      for (var file : deleted) {
        var target = targetOf(dirs, file);
        if (target != null) {
          Files.deleteIfExists(target);
        }
      }
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private static Path targetOf(List<Source> dirs, Path file) {
    for (var source : dirs) {
      if (file.startsWith(source.dir())) {
        return source.target().resolve(source.dir().relativize(file));
      }
    }
    return null;
  }

  static void deleteTree(Path dir) throws IOException {
    if (!Files.exists(dir)) {
      return;
    }
    try (Stream<Path> tree = Files.walk(dir)) {
      for (var path : tree.sorted(Comparator.reverseOrder()).toList()) {
        Files.delete(path);
      }
    }
  }
}
