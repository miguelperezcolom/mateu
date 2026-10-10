package io.mateu.core.infra.dev;

import java.lang.ref.WeakReference;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

/**
 * The single invalidation mechanism of development mode: every cache of {@code specs/ui/**}
 * registers here ({@link SpecsCache}), the watcher reports changes here, and the dev endpoint
 * streams what happened to the browsers from here.
 *
 * <p>Two things a registry does to take part:
 *
 * <ol>
 *   <li>read its files through {@link #classLoader(ClassLoader)} — a pass-through outside dev mode;
 *       in dev mode {@code specs/ui/**} resolves against the SOURCE directory, so an edit is seen
 *       without a rebuild;
 *   <li>{@link #register(SpecsCache)} itself, dropping its cache in {@link
 *       SpecsCache#invalidateSpecs()}.
 * </ol>
 */
@Slf4j
public final class DevSpecs {

  /** The classpath root of the specs. */
  public static final String ROOT = "specs/ui";

  /** {@code scope} of a change the current screen can absorb by re-rendering itself. */
  public static final String SCOPE_PAGE = "page";

  /** {@code scope} of a change to the shell, the routes or the mounts: remount the app. */
  public static final String SCOPE_APP = "app";

  private static final List<WeakReference<SpecsCache>> CACHES = new CopyOnWriteArrayList<>();

  private static final Sinks.Many<DevEvent> EVENTS = Sinks.many().multicast().directBestEffort();

  private static final Pattern APP_LEVEL_TYPE =
      Pattern.compile(
          "(?m)^type:\\s*['\"]?(UI|Routes|AppShell|App|Project|Environment|Translations|Actions)['\"]?\\s*$");

  /** Conventional app-wide files, by name (the {@code type:} header is optional in them). */
  private static final java.util.Set<String> APP_LEVEL_NAMES =
      java.util.Set.of("routes.yaml", "routes.yml", "sources.yaml", "project.yaml", "actions.yaml");

  /** Conventional app-wide directories: a file there may omit its {@code type:} header. */
  private static final java.util.Set<String> APP_LEVEL_DIRS =
      java.util.Set.of("translations", "environments");

  private DevSpecs() {}

  /** One thing that happened, as streamed to the browsers. */
  public record DevEvent(String type, List<String> files, String scope) {}

  /** Registers a cache to be dropped when the specs change (weakly held). */
  public static void register(SpecsCache cache) {
    if (cache != null) {
      CACHES.add(new WeakReference<>(cache));
    }
  }

  /**
   * The classloader to read {@code specs/ui/**} through: {@code classLoader} itself outside dev
   * mode; in dev mode a view of it where the specs come from the source directory.
   */
  public static ClassLoader classLoader(ClassLoader classLoader) {
    var parent = classLoader != null ? classLoader : DevSpecs.class.getClassLoader();
    if (!DevMode.enabled() || parent instanceof DevSpecsClassLoader) {
      return parent;
    }
    var dirs = DevMode.specsDirs();
    return dirs.isEmpty() ? parent : new DevSpecsClassLoader(parent, dirs);
  }

  /** Drops every registered cache. */
  public static void invalidateAll() {
    for (var ref : CACHES) {
      var cache = ref.get();
      if (cache == null) {
        CACHES.remove(ref);
        continue;
      }
      try {
        cache.invalidateSpecs();
      } catch (RuntimeException e) {
        log.warn("Could not invalidate {}: {}", cache.getClass().getName(), e.getMessage());
      }
    }
  }

  /**
   * Spec files changed (absolute paths): drop every cache and tell the browsers. The scope is
   * {@value #SCOPE_APP} when a route file, a mount, an app shell, the source or action catalogue,
   * the project descriptor, a translation or an environment changed (or a file was deleted — what
   * it was is unknown by then), else {@value #SCOPE_PAGE}.
   */
  public static void changed(List<Path> files) {
    invalidateAll();
    var names = new ArrayList<String>();
    var scope = SCOPE_PAGE;
    for (var file : files) {
      names.add(relativeName(file));
      if (isAppLevel(file)) {
        scope = SCOPE_APP;
      }
    }
    log.info("Specs changed ({} scope): {}", scope, names);
    emit(new DevEvent("specs-changed", List.copyOf(names), scope));
  }

  /**
   * Re-render the current screen of every open browser — the trigger an IDE fires after a HotSwap
   * (the code changed, the specs did not). Caches are dropped too, cheaply.
   */
  public static void reload(String scope) {
    invalidateAll();
    var s = SCOPE_APP.equals(scope) ? SCOPE_APP : SCOPE_PAGE;
    log.info("Reload requested ({} scope)", s);
    emit(new DevEvent("reload", List.of(), s));
  }

  // A multicast sink refuses concurrent emitters: serialise the watcher and the reload endpoint.
  private static synchronized void emit(DevEvent event) {
    EVENTS.tryEmitNext(event);
  }

  /** The live stream of changes (hot: only what happens after subscribing). */
  public static Flux<DevEvent> events() {
    return EVENTS.asFlux();
  }

  static boolean isAppLevel(Path file) {
    var name = file.getFileName() == null ? "" : file.getFileName().toString();
    if (APP_LEVEL_NAMES.contains(name)) {
      return true;
    }
    var parent = file.getParent() == null ? null : file.getParent().getFileName();
    if (parent != null && APP_LEVEL_DIRS.contains(parent.toString())) {
      return true;
    }
    if (!Files.isRegularFile(file)) {
      return true;
    }
    try {
      return APP_LEVEL_TYPE.matcher(Files.readString(file)).find();
    } catch (Exception e) {
      return true;
    }
  }

  static String relativeName(Path file) {
    for (var dir : DevMode.specsDirs()) {
      if (file.startsWith(dir)) {
        return ROOT + "/" + dir.relativize(file).toString().replace('\\', '/');
      }
    }
    return file.toString();
  }
}
