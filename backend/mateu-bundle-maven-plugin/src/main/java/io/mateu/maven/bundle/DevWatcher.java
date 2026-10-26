package io.mateu.maven.bundle;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeSet;
import java.util.function.Consumer;
import java.util.stream.Stream;

/**
 * Polls the directories the bundle is built from and reports what changed, debounced: an editor
 * saving a file writes it in several steps and a {@code git checkout} touches dozens of files, so
 * one report is made per burst, once the tree has stopped moving.
 *
 * <p>Polling SNAPSHOTS (path → size + mtime) rather than a {@link java.nio.file.WatchService}, as
 * the core's dev-mode watcher does on macOS: the JDK's watch service there is itself a poller with
 * a 2–10 s period, and a specs tree is a few dozen small files — a snapshot every few hundred
 * milliseconds costs nothing and behaves the same on every platform.
 */
final class DevWatcher implements AutoCloseable {

  /** What changed in one burst: files added or modified, and files deleted (absolute paths). */
  record Changes(List<Path> changed, List<Path> deleted) {
    boolean isEmpty() {
      return changed.isEmpty() && deleted.isEmpty();
    }
  }

  private final List<Path> dirs;
  private final long pollMillis;
  private final Consumer<Changes> onChange;
  private final Thread thread;
  private Map<Path, String> before = Map.of();

  DevWatcher(List<Path> dirs, long pollMillis, Consumer<Changes> onChange) {
    this.dirs = List.copyOf(dirs);
    this.pollMillis = pollMillis;
    this.onChange = onChange;
    this.thread = new Thread(this::run, "mateu-dev-watcher");
    this.thread.setDaemon(true);
  }

  /** Takes the first snapshot (so a change made right after this returns is seen) and polls. */
  void start() {
    before = snapshot(dirs);
    thread.start();
  }

  @Override
  public void close() {
    thread.interrupt();
  }

  private void run() {
    try {
      while (!Thread.currentThread().isInterrupted()) {
        Thread.sleep(pollMillis);
        var after = snapshot(dirs);
        if (after.equals(before)) {
          continue;
        }
        // Debounce: wait until the tree stops moving before reporting.
        var settled = after;
        do {
          after = settled;
          Thread.sleep(pollMillis);
          settled = snapshot(dirs);
        } while (!settled.equals(after));
        var changes = diff(before, after);
        before = after;
        if (!changes.isEmpty()) {
          onChange.accept(changes);
        }
      }
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  /** path → "size:mtime" of every regular file under the dirs (missing dirs are empty). */
  static Map<Path, String> snapshot(List<Path> dirs) {
    var snapshot = new HashMap<Path, String>();
    for (var dir : dirs) {
      if (!Files.isDirectory(dir)) {
        continue;
      }
      try (Stream<Path> tree = Files.walk(dir)) {
        tree.filter(Files::isRegularFile).forEach(file -> snapshot.put(file, stamp(file)));
      } catch (IOException | UncheckedIOException e) {
        // a file vanished mid-walk: the next poll sees the settled tree
      }
    }
    return snapshot;
  }

  private static String stamp(Path file) {
    try {
      return Files.size(file) + ":" + Files.getLastModifiedTime(file).toMillis();
    } catch (IOException e) {
      return "gone";
    }
  }

  static Changes diff(Map<Path, String> before, Map<Path, String> after) {
    var changed = new TreeSet<Path>();
    var deleted = new TreeSet<Path>();
    after.forEach(
        (path, stamp) -> {
          if (!Objects.equals(before.get(path), stamp)) {
            changed.add(path);
          }
        });
    before.keySet().stream().filter(path -> !after.containsKey(path)).forEach(deleted::add);
    return new Changes(List.copyOf(changed), List.copyOf(deleted));
  }
}
