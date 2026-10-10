package io.mateu.core.infra.dev;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

/**
 * Development mode: the specs are read from the SOURCE tree and watched, every cache built from
 * them is dropped on change, and the {@code /mateu/dev/**} endpoints push the change to the open
 * browsers (live reload).
 *
 * <p><b>OFF by default.</b> It is turned on by {@value #PROPERTY}{@code =true} (a system property,
 * or the framework's configuration through the adapter) or by the environment variable {@value
 * #ENV}{@code =true}. Nothing in a production profile sets it; the IDE's "Run Mateu App (live)"
 * action does. When on, a loud WARN is logged at startup: the dev endpoints let any caller force a
 * re-render on every open browser and reveal which spec files changed.
 *
 * <p>The specs directory defaults to {@value #DEFAULT_SPECS_DIR} under the working directory and is
 * overridden by {@value #SPECS_DIR_PROPERTY} / {@value #SPECS_DIR_ENV} (comma-separated for a
 * multi-module project).
 */
@Slf4j
public final class DevMode {

  /** The property that turns dev mode on. */
  public static final String PROPERTY = "mateu.dev";

  /** The environment variable that turns dev mode on. */
  public static final String ENV = "MATEU_DEV";

  /** Where the specs are read from in dev mode (comma-separated). */
  public static final String SPECS_DIR_PROPERTY = "mateu.dev.specs-dir";

  /** Environment twin of {@link #SPECS_DIR_PROPERTY}. */
  public static final String SPECS_DIR_ENV = "MATEU_DEV_SPECS_DIR";

  /** The default specs directory, relative to the working directory. */
  public static final String DEFAULT_SPECS_DIR = "src/main/resources/specs/ui";

  private static volatile Boolean forced;
  private static volatile String configuredSpecsDirs;
  private static volatile boolean warned;

  private DevMode() {}

  /** Whether dev mode is on. */
  public static boolean enabled() {
    var f = forced;
    if (f != null) {
      return f;
    }
    return truthy(System.getProperty(PROPERTY)) || truthy(System.getenv(ENV));
  }

  /**
   * Turns dev mode on from an adapter's configuration (Spring/Quarkus/Micronaut/Helidon property
   * {@value #PROPERTY}{@code =true}). Idempotent: logs the warning and starts the watcher once.
   *
   * @param specsDirs the configured specs directories, or null for the default
   */
  public static synchronized void enable(String specsDirs) {
    forced = true;
    if (specsDirs != null && !specsDirs.isBlank()) {
      configuredSpecsDirs = specsDirs;
    }
    start();
  }

  /** Starts dev mode when the system property / environment says so. Idempotent. */
  public static synchronized void startIfEnabled() {
    if (enabled()) {
      start();
    }
  }

  /** Turns dev mode off (tests). */
  public static synchronized void disable() {
    forced = false;
    configuredSpecsDirs = null;
    SpecsWatcher.stopAll();
    DevSpecs.invalidateAll();
  }

  /** Tests: back to "decided by the system property / environment". */
  public static synchronized void reset() {
    forced = null;
    configuredSpecsDirs = null;
    warned = false;
    SpecsWatcher.stopAll();
    DevSpecs.invalidateAll();
  }

  private static void start() {
    var dirs = specsDirs();
    if (!warned) {
      warned = true;
      log.warn(
          "\n**************************************************************************\n"
              + "  MATEU DEVELOPMENT MODE IS ON ({}=true)\n"
              + "  specs are read from {} and watched;\n"
              + "  {} and {} are served.\n"
              + "  NEVER enable this in production.\n"
              + "**************************************************************************",
          PROPERTY,
          dirs.isEmpty() ? "(no specs directory found — classpath)" : dirs,
          DevEndpoint.EVENTS_PATH,
          DevEndpoint.RELOAD_PATH);
    }
    // Whatever was loaded from the classpath before dev mode was switched on is stale now.
    DevSpecs.invalidateAll();
    SpecsWatcher.watch(dirs);
  }

  /** The existing specs directories dev mode reads and watches (absolute, normalized). */
  public static List<Path> specsDirs() {
    var raw = configuredSpecsDirs;
    if (raw == null) {
      raw = System.getProperty(SPECS_DIR_PROPERTY);
    }
    if (raw == null) {
      raw = System.getenv(SPECS_DIR_ENV);
    }
    if (raw == null || raw.isBlank()) {
      raw = DEFAULT_SPECS_DIR;
    }
    var dirs = new ArrayList<Path>();
    for (var part : raw.split(",")) {
      if (part.isBlank()) {
        continue;
      }
      var path = Path.of(part.trim()).toAbsolutePath().normalize();
      if (Files.isDirectory(path)) {
        dirs.add(path);
      }
    }
    return dirs;
  }

  private static boolean truthy(String value) {
    return value != null && (value.equalsIgnoreCase("true") || value.equals("1"));
  }
}
