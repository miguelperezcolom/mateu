package io.mateu.uidl;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Simple names shared by two public uidl packages (or by a uidl package and {@code java.lang} /
 * {@code java.util}) make star imports ambiguous: {@code import io.mateu.uidl.annotations.*;} plus
 * {@code import io.mateu.uidl.data.*;} and a bare {@code Badge} does not compile. Most of them are
 * deliberate pairs — the annotation and the fluent record of the same concept ({@code @Badge} /
 * {@code Badge}) — and are resolved by the explicit-import rule documented in
 * reference/stability-and-versioning.md ("Imports"): a single-type import always wins over a star
 * import.
 *
 * <p>This test pins the current list so a NEW collision is a reviewed decision, not an accident.
 * Removing one from the list (because a name went away) is always fine.
 */
class NameCollisionsTest {

  private static final Set<String> JDK_PACKAGES =
      Set.of("java.lang", "java.util", "java.util.function", "java.time");

  /** The accepted collisions: name → the packages that declare it. */
  private static final Map<String, String> ACCEPTED =
      Map.ofEntries(
          // annotation ⇄ fluent/data record of the same concept
          Map.entry("Action", "annotations fluent"),
          Map.entry("App", "annotations interfaces"),
          Map.entry("Avatar", "annotations data"),
          Map.entry("Badge", "annotations data"),
          Map.entry("Breadcrumb", "annotations data"),
          Map.entry("Breadcrumbs", "annotations data"),
          Map.entry("BulletedList", "annotations data"),
          Map.entry("Button", "annotations data"),
          Map.entry("Details", "annotations data"),
          Map.entry("Filterable", "annotations interfaces"),
          Map.entry("FormLayout", "annotations data"),
          Map.entry("Icon", "annotations data"),
          Map.entry("KPI", "annotations data"),
          Map.entry("Menu", "annotations data"),
          Map.entry("Notice", "annotations data"),
          Map.entry("RestAction", "annotations data"),
          Map.entry("Rule", "annotations data"),
          Map.entry("Searchable", "annotations interfaces"),
          Map.entry("Status", "annotations data"),
          Map.entry("Tab", "annotations data"),
          Map.entry("Text", "annotations data"),
          Map.entry("Tooltip", "annotations data"),
          Map.entry("Trigger", "annotations fluent"),
          Map.entry("UI", "annotations fluent"),
          Map.entry("Validation", "annotations data"),
          // two shapes of one idea in two layers
          Map.entry("Listing", "fluent interfaces"),
          Map.entry("Page", "data interfaces"),
          Map.entry("Step", "data fluent"),
          // with the JDK
          Map.entry("List", "annotations java.util"),
          Map.entry("Map", "data java.util"),
          Map.entry("Calendar", "data java.util"));

  @Test
  void noNewSimpleNameCollisions() throws IOException {
    var root = Path.of("src/main/java/io/mateu/uidl");
    Map<String, Set<String>> packagesByName = new TreeMap<>();
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
        var name = file.getFileName().toString().replace(".java", "");
        if (name.equals("package-info")) {
          continue;
        }
        var dir = root.relativize(file.getParent()).toString().replace('\\', '/');
        var pkg = dir.isEmpty() ? "uidl" : dir.replace('/', '.');
        packagesByName.computeIfAbsent(name, k -> new TreeSet<>()).add(pkg);
      }
    }
    for (var entry : packagesByName.entrySet()) {
      for (var jdk : JDK_PACKAGES) {
        try {
          var jdkClass =
              Class.forName(
                  jdk + "." + entry.getKey(), false, ClassLoader.getPlatformClassLoader());
          // only an importable (public) JDK type can clash; java.util.TaskQueue is Timer's private
          // one
          if (java.lang.reflect.Modifier.isPublic(jdkClass.getModifiers())) {
            entry.getValue().add(jdk);
          }
        } catch (ClassNotFoundException e) {
          // not a JDK name
        }
      }
    }
    Map<String, String> actual =
        packagesByName.entrySet().stream()
            .filter(e -> e.getValue().size() > 1)
            .collect(
                Collectors.toMap(
                    Map.Entry::getKey,
                    e -> String.join(" ", e.getValue()),
                    (a, b) -> a,
                    TreeMap::new));
    var added = new TreeMap<>(actual);
    added.keySet().removeAll(ACCEPTED.keySet());
    assertThat(added)
        .as(
            "new simple-name collisions in the public API — rename the new type, or add it to"
                + " ACCEPTED after review (star imports become ambiguous)")
        .isEmpty();
  }
}
