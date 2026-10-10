package io.mateu.core.infra.dev;

import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_DELETE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.WatchService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeSet;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;

/**
 * Watches the specs directories and reports what changed to {@link DevSpecs#changed(List)},
 * debounced — an editor saving a file emits several events (truncate, write, rename of a temp
 * file), and a {@code git checkout} touches dozens of files at once: one notification per burst.
 *
 * <p>What changed is always decided by comparing SNAPSHOTS (path → size + mtime), never by trusting
 * the event kinds, which differ per platform and per editor. The trigger to take a snapshot is the
 * {@link WatchService} where it is native (Linux, Windows); on macOS the JDK's WatchService is
 * itself a poller with a 2–10 s period, so there a 300 ms snapshot poll is both faster and cheaper
 * (a specs tree is a few dozen small files).
 */
@Slf4j
final class SpecsWatcher {

  static final long DEBOUNCE_MILLIS = 150;
  static final long POLL_MILLIS = 300;

  private static volatile Thread thread;
  private static volatile List<Path> watched = List.of();
  private static volatile boolean hooked;

  private SpecsWatcher() {}

  static synchronized void watch(List<Path> dirs) {
    if (dirs.isEmpty()) {
      return;
    }
    if (thread != null && thread.isAlive() && watched.equals(dirs)) {
      return;
    }
    stopAll();
    if (!hooked) {
      hooked = true;
      // A JVM going down must not report edits it will never serve: the browsers would re-request
      // the screen from a server that is gone, instead of waiting for the restarted one's hello.
      Runtime.getRuntime()
          .addShutdownHook(new Thread(SpecsWatcher::stopAll, "mateu-dev-specs-watcher-stop"));
    }
    watched = List.copyOf(dirs);
    var t = new Thread(() -> run(watched), "mateu-dev-specs-watcher");
    t.setDaemon(true);
    thread = t;
    t.start();
    log.info("Watching specs in {}", dirs);
  }

  static synchronized void stopAll() {
    var t = thread;
    thread = null;
    watched = List.of();
    if (t != null) {
      t.interrupt();
    }
  }

  private static void run(List<Path> dirs) {
    var native_ = !System.getProperty("os.name", "").toLowerCase().contains("mac");
    WatchService watchService = null;
    try {
      if (native_) {
        watchService = FileSystems.getDefault().newWatchService();
        registerAll(watchService, dirs);
      }
      var before = snapshot(dirs);
      while (!Thread.currentThread().isInterrupted()) {
        if (watchService != null) {
          var key = watchService.poll(1, TimeUnit.SECONDS);
          if (key == null) {
            continue;
          }
          key.pollEvents();
          key.reset();
          // drain the rest of the burst
          Thread.sleep(DEBOUNCE_MILLIS);
          for (var more = watchService.poll(); more != null; more = watchService.poll()) {
            more.pollEvents();
            more.reset();
          }
          registerAll(watchService, dirs); // directories created meanwhile
        } else {
          Thread.sleep(POLL_MILLIS);
        }
        var after = snapshot(dirs);
        if (after.equals(before)) {
          continue;
        }
        // Debounce: wait until the tree stops moving before reporting.
        Thread.sleep(DEBOUNCE_MILLIS);
        var settled = snapshot(dirs);
        while (!settled.equals(after)) {
          after = settled;
          Thread.sleep(DEBOUNCE_MILLIS);
          settled = snapshot(dirs);
        }
        var changed = diff(before, after);
        before = after;
        if (!changed.isEmpty()) {
          try {
            DevSpecs.changed(changed);
          } catch (RuntimeException e) {
            log.warn("Live reload failed to process {}: {}", changed, e.getMessage());
          }
        }
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    } catch (IOException e) {
      log.warn("Cannot watch the specs in {}: {}", dirs, e.getMessage());
    } finally {
      if (watchService != null) {
        try {
          watchService.close();
        } catch (IOException ignored) {
          // closing anyway
        }
      }
    }
  }

  private static void registerAll(WatchService watchService, List<Path> dirs) throws IOException {
    for (var dir : dirs) {
      if (!Files.isDirectory(dir)) {
        continue;
      }
      try (Stream<Path> tree = Files.walk(dir)) {
        for (var sub : tree.filter(Files::isDirectory).toList()) {
          sub.register(watchService, ENTRY_CREATE, ENTRY_MODIFY, ENTRY_DELETE);
        }
      }
    }
  }

  /** path → "size:mtime" of every regular file under the dirs. */
  static Map<Path, String> snapshot(List<Path> dirs) {
    var snapshot = new HashMap<Path, String>();
    for (var dir : dirs) {
      if (!Files.isDirectory(dir)) {
        continue;
      }
      try (Stream<Path> tree = Files.walk(dir)) {
        tree.filter(Files::isRegularFile)
            .forEach(
                file -> {
                  try {
                    snapshot.put(
                        file, Files.size(file) + ":" + Files.getLastModifiedTime(file).toMillis());
                  } catch (IOException ignored) {
                    // vanished between the walk and the stat: the next snapshot sees it gone
                  }
                });
      } catch (IOException | java.io.UncheckedIOException ignored) {
        // a directory removed mid-walk: the next snapshot is consistent again
      }
    }
    return snapshot;
  }

  static List<Path> diff(Map<Path, String> before, Map<Path, String> after) {
    var changed = new TreeSet<Path>();
    for (var entry : after.entrySet()) {
      if (!Objects.equals(before.get(entry.getKey()), entry.getValue())) {
        changed.add(entry.getKey());
      }
    }
    for (var path : before.keySet()) {
      if (!after.containsKey(path)) {
        changed.add(path);
      }
    }
    return new ArrayList<>(changed);
  }
}
