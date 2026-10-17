package io.mateu.core.infra.dev;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Live reload in development mode: an edit to a spec under a watched directory reaches the browsers
 * as ONE {@code specs-changed} event per burst, decided by comparing snapshots — on both trigger
 * paths, the native {@code WatchService} (Linux, Windows) and the snapshot poll (macOS).
 */
class SpecsWatcherTest {

  @TempDir Path specs;

  @AfterEach
  void stop() {
    SpecsWatcher.stopAll();
  }

  @Test
  void theDiffNamesWhatWasAddedChangedAndDeleted() {
    var a = Path.of("a.yaml");
    var b = Path.of("b.yaml");
    var c = Path.of("c.yaml");
    var changed =
        SpecsWatcher.diff(Map.of(a, "1:1", b, "1:1"), Map.of(a, "1:1", b, "2:5", c, "1:9"));
    assertThat(changed).containsExactly(b, c);
    assertThat(SpecsWatcher.diff(Map.of(a, "1:1"), Map.of())).containsExactly(a);
  }

  @Test
  void aSnapshotSkipsAMissingDirectoryAndSeesNestedFiles() throws Exception {
    var nested = Files.createDirectories(specs.resolve("orders"));
    Files.writeString(nested.resolve("list.yaml"), "layout: {}");
    var snapshot = SpecsWatcher.snapshot(List.of(specs, specs.resolve("nope")));
    assertThat(snapshot).containsOnlyKeys(nested.resolve("list.yaml"));
  }

  @Test
  void anEditIsReportedOnTheSnapshotPoll() throws Exception {
    assertEditReported("Mac OS X");
  }

  @Test
  void anEditIsReportedOnTheNativeWatchService() throws Exception {
    // macOS has no native WatchService (the JDK's is itself a 10 s poller): there, this path is
    // never taken, so it is only exercised where it is real
    org.junit.jupiter.api.Assumptions.assumeFalse(
        System.getProperty("os.name", "").toLowerCase().contains("mac"));
    assertEditReported(System.getProperty("os.name"));
  }

  private void assertEditReported(String os) throws Exception {
    var page = specs.resolve("page.yaml");
    Files.writeString(page, "layout: {type: Text, text: one}\n");
    var previous = System.getProperty("os.name");
    var next = DevSpecs.events().filter(e -> "specs-changed".equals(e.type())).next().toFuture();
    try {
      System.setProperty("os.name", os);
      SpecsWatcher.watch(List.of(specs));
      // the same directories again: the running watcher is kept
      SpecsWatcher.watch(List.of(specs));
      SpecsWatcher.watch(List.of());
      waitUntilWatching();
    } finally {
      System.setProperty("os.name", previous);
    }
    // the watcher snapshots when it starts: give it a moment, then edit until it reports
    var deadline = System.nanoTime() + Duration.ofSeconds(5).toNanos();
    var n = 0;
    while (!next.isDone() && System.nanoTime() < deadline) {
      Files.writeString(page, "layout: {type: Text, text: edit " + (n++) + "}\n");
      Thread.sleep(200);
    }
    assertThat(next).isDone();
    var event = next.get();
    assertThat(event.files()).anyMatch(f -> f.endsWith("page.yaml"));
    assertThat(event.scope()).isEqualTo(DevSpecs.SCOPE_PAGE);
  }

  private static void waitUntilWatching() throws InterruptedException {
    // the thread reads os.name first thing; a short wait keeps the property set until it has
    Thread.sleep(100);
  }
}
