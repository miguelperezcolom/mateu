package io.mateu.explorer;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import io.mateu.explorer.catalog.Entry;
import io.mateu.explorer.catalog.ExplorerCatalog;
import io.mateu.explorer.catalog.UidlCatalog;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

/**
 * THE COVERAGE GUARD.
 *
 * <ol>
 *   <li>The checklist knows every component of Mateu's catalogue ({@code uidl-catalog.json}, read
 *       from the mateu-uidl jar) and every {@code FormTemplate}: a new component without a
 *       checklist id fails here.
 *   <li>Every entry file is well-formed: its area/group exist, every id it covers is a checklist id,
 *       it runs something (or says why it cannot), and every file it runs or shows exists — the
 *       YAML it draws, the class it embeds, the sources of its Code tabs.
 *   <li>Checklist ids no entry covers yet are PENDING: a failure (STRICT by default — every id is
 *       covered by an example or a {@code notDemonstrable:} reason); {@code
 *       -Dexplorer.coverage.strict=false} only reports them, for work in progress.
 *   <li>A description that talks about a known issue / gap carries a {@code knownIssue:} line, so
 *       the probe and this report list it. Known issues are reported, never a failure.
 * </ol>
 */
class ExplorerCoverageTest {

  static final Path MODULE = Path.of("").toAbsolutePath();

  @Test
  void theChecklistKnowsEveryComponentAndPageTemplate() {
    var catalog = ExplorerCatalog.get();
    var ids = catalog.items().keySet();
    var missing = new TreeSet<String>();
    for (var type : UidlCatalog.descriptions().keySet()) {
      if (!ids.contains("component:" + type)) {
        missing.add("component:" + type);
      }
    }
    for (var template : UidlCatalog.families().getOrDefault("FormTemplate", List.of())) {
      if (!ids.contains("template:" + template)) {
        missing.add("template:" + template);
      }
    }
    var stale = new TreeSet<String>();
    for (var id : ids) {
      if (id.startsWith("component:")
          && !UidlCatalog.descriptions().containsKey(id.substring("component:".length()))) {
        stale.add(id);
      }
    }
    if (!missing.isEmpty() || !stale.isEmpty()) {
      fail(
          "explorer/checklist.yaml is out of step with uidl-catalog.json.\n  Missing: "
              + missing
              + "\n  Not in the catalogue any more: "
              + stale);
    }
  }

  @Test
  void everyEntryIsWellFormedAndEveryFileItNamesExists() {
    var catalog = ExplorerCatalog.get();
    var groups = new HashSet<String>();
    catalog.areas().forEach(a -> a.groups().forEach(g -> groups.add(g.key())));
    var problems = new ArrayList<String>();
    var routes = new HashSet<String>();
    for (Entry e : catalog.entries()) {
      var where = "entry '" + e.id() + "' (" + e.file() + "): ";
      if (!groups.contains(e.area() + "/" + e.group())) {
        problems.add(where + "unknown area/group " + e.area() + "/" + e.group());
      }
      if (e.covers().isEmpty()) {
        problems.add(where + "covers nothing");
      }
      for (var id : e.covers()) {
        if (!catalog.items().containsKey(id)) {
          problems.add(where + "covers '" + id + "', which is not a checklist id");
        }
      }
      if (e.examples().isEmpty() && e.notDemonstrable() == null) {
        problems.add(where + "has no examples and no notDemonstrable reason");
      }
      if (!routes.add(e.route())) {
        problems.add(where + "route " + e.route() + " used twice");
      }
      if (e.knownIssue() == null && mentionsAKnownIssue(e)) {
        problems.add(where + "its description mentions a known issue: add a knownIssue: line");
      }
      for (var x : e.examples()) {
        int kinds = (x.yaml() != null ? 1 : 0) + (x.java() != null ? 1 : 0) + (x.route() != null ? 1 : 0);
        if (kinds != 1) {
          problems.add(where + "example '" + x.title() + "' must name exactly one of yaml/java/route");
        }
        if (x.yaml() != null) {
          requireFile(problems, where, "src/main/resources/" + x.yaml());
        }
        if (x.java() != null) {
          requireClass(problems, where, x.java());
        }
        if (x.route() != null
            && e.pages().stream().noneMatch(p -> p.route().equals(x.route()))
            && catalog.entries().stream().flatMap(o -> o.pages().stream()).noneMatch(p -> p.route().equals(x.route()))) {
          problems.add(where + "example route '" + x.route() + "' is not declared under any entry's pages:");
        }
      }
      for (var p : e.pages()) {
        if (p.route() == null || (p.layout() == null && p.viewModel() == null)) {
          problems.add(where + "a page needs a route and a layout and/or a viewModel");
          continue;
        }
        if (!routes.add(p.route())) {
          problems.add(where + "route " + p.route() + " used twice");
        }
        if (p.layout() != null) {
          requireFile(problems, where, "src/main/resources/specs/ui/" + p.layout());
        }
        if (p.viewModel() != null) {
          requireClass(problems, where, p.viewModel());
        }
      }
      for (var c : e.code()) {
        requireFile(problems, where, c.path());
        assertTrue(
            ExplorerCatalog.source(c.path()).isPresent() || !Files.exists(MODULE.resolve(c.path())),
            where
                + c.path()
                + " exists but the build did not copy it into explorer-src/ — keep sources under"
                + " src/main/java/io/mateu/explorer/examples, src/main/resources/specs/ui or src/main/ports");
      }
    }
    if (!problems.isEmpty()) {
      fail("Explorer entries with problems:\n  " + String.join("\n  ", problems));
    }
  }

  @Test
  void pendingChecklistIdsAreReported() {
    var catalog = ExplorerCatalog.get();
    var pending = catalog.pending();
    var byGroup = new java.util.TreeMap<String, List<String>>();
    pending.forEach(i -> byGroup.computeIfAbsent(i.group(), k -> new ArrayList<>()).add(i.id()));
    int total = catalog.items().size();
    var report = new StringBuilder();
    report
        .append("Explorer coverage: ")
        .append(total - pending.size())
        .append(" / ")
        .append(total)
        .append(" checklist ids covered by ")
        .append(catalog.entries().size())
        .append(" entries (")
        .append(catalog.entries().stream().filter(e -> e.notDemonstrable() != null).count())
        .append(" not demonstrable live, ")
        .append(catalog.entries().stream().filter(e -> e.knownIssue() != null).count())
        .append(" with a known issue). PENDING:\n");
    byGroup.forEach((g, ids) -> report.append("  ").append(g).append(": ").append(ids).append('\n'));
    catalog.entries().stream()
        .filter(e -> e.knownIssue() != null)
        .forEach(e -> report.append("  known issue [").append(e.route()).append("] ")
            .append(e.knownIssue().replaceAll("\\s+", " ")).append('\n'));
    System.out.println(report);
    if (!"false".equals(System.getProperty("explorer.coverage.strict")) && !pending.isEmpty()) {
      fail(report.toString());
    }
  }

  private static boolean mentionsAKnownIssue(Entry e) {
    var texts = new ArrayList<String>();
    texts.add(e.description());
    e.examples().forEach(x -> texts.add(x.description()));
    return texts.stream()
        .filter(t -> t != null)
        .anyMatch(t -> t.matches("(?is).*known (issues?|gaps?)\\b.*"));
  }

  private static void requireFile(List<String> problems, String where, String path) {
    if (!Files.isRegularFile(MODULE.resolve(path))) {
      problems.add(where + "missing file " + path);
    }
  }

  private static void requireClass(List<String> problems, String where, String className) {
    try {
      Class.forName(className);
    } catch (ClassNotFoundException e) {
      problems.add(where + "no class " + className);
    }
    var src = Entry.javaSource(className);
    if (!Files.isRegularFile(MODULE.resolve(src))) {
      problems.add(where + "no source " + src + " (examples must be classes of this module)");
    }
    if (!src.startsWith("src/main/java/io/mateu/explorer/examples/")) {
      problems.add(where + className + " must live under io.mateu.explorer.examples (its source is shown)");
    }
  }
}
