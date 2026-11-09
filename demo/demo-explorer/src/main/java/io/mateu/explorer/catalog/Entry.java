package io.mateu.explorer.catalog;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * One Explorer entry, read from its own file under {@code explorer/entries/}. See README.md for the
 * format. Its page lives at {@link #route()}.
 *
 * @param covers the checklist ids this entry demonstrates (component:X, behaviour:y…)
 * @param examples what runs live on the page, in order
 * @param pages extra routes the entry registers, for examples that are whole pages
 * @param extraCode source files shown in the Code tabs besides the ones the examples imply
 * @param notDemonstrable instead of examples: why this id cannot run live (the coverage guard
 *     accepts it as covered with a reason)
 * @param knownIssue a Mateu bug this entry runs into (shown in its description too): reported by
 *     the coverage guard and the Explorer probe, never a failure — drop it once the fix ships
 * @param probeAllows what the Explorer probe tolerates on this page because the example does it ON
 *     PURPOSE (a console text such as {@code status of 403}, a down remote's {@code
 *     ERR_CONNECTION_REFUSED}, an error text the example exists to show)
 */
public record Entry(
    String id,
    String area,
    String group,
    String title,
    List<String> covers,
    String description,
    String doc,
    List<Example> examples,
    List<Page> pages,
    List<CodeFile> extraCode,
    String notDemonstrable,
    String knownIssue,
    List<String> probeAllows,
    String file) {

  /**
   * One live example. Exactly one of {@code yaml}, {@code java} or {@code route}:
   *
   * <ul>
   *   <li>{@code yaml}: a classpath path ({@code specs/ui/explorer/...yaml}) of a YAML partial,
   *       drawn in place ({@code Partial});
   *   <li>{@code java}: a class name, embedded as an INDEPENDENT island ({@code EmbeddedView}) so
   *       its own actions run against it; {@code embed: inline} draws a {@code Component} /
   *       {@code ComponentTreeSupplier} in place instead;
   *   <li>{@code route}: a whole page (registered under {@code pages:}), embedded as a micro
   *       frontend and linked to open on its own.
   * </ul>
   */
  public record Example(
      String title, String description, String yaml, String java, String route, String embed) {}

  /** An extra route: {@code layout} (a YAML definition) and/or {@code viewModel} (a class). */
  public record Page(String route, String layout, String viewModel) {}

  /** A source file shown in a Code tab: a path relative to the module ({@code src/main/...}). */
  public record CodeFile(String label, String path, String language) {}

  /** The entry page's route: {@code <area>/<group>/<id>} (the menu nests leaves under groups). */
  public String route() {
    return area + "/" + group + "/" + id;
  }

  /** Every file shown in the Code tabs: the ones the examples and pages imply, then the extras. */
  public List<CodeFile> code() {
    var files = new LinkedHashMap<String, CodeFile>();
    for (var e : examples) {
      if (e.yaml() != null) {
        add(files, "src/main/resources/" + e.yaml(), null);
      }
      if (e.java() != null) {
        add(files, javaSource(e.java()), null);
      }
    }
    for (var p : pages) {
      if (p.layout() != null) {
        add(files, "src/main/resources/specs/ui/" + p.layout(), null);
      }
      if (p.viewModel() != null) {
        add(files, javaSource(p.viewModel()), null);
      }
    }
    for (var c : extraCode) {
      add(files, c.path(), c.label());
    }
    return List.copyOf(files.values());
  }

  public static String javaSource(String className) {
    var top = className.contains("$") ? className.substring(0, className.indexOf('$')) : className;
    return "src/main/java/" + top.replace('.', '/') + ".java";
  }

  public static String languageOf(String path) {
    var ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase();
    return switch (ext) {
      case "yaml", "yml" -> "yaml";
      case "java" -> "java";
      case "cs" -> "csharp";
      case "py" -> "python";
      case "properties" -> "properties";
      case "json" -> "json";
      case "kt" -> "kotlin";
      case "ts" -> "typescript";
      default -> ext;
    };
  }

  private static void add(Map<String, CodeFile> files, String path, String label) {
    files.putIfAbsent(path, new CodeFile(label, path, languageOf(path)));
  }

  // ------------------------------------------------------------------------------------------

  @SuppressWarnings("unchecked")
  static Entry of(Map<String, Object> raw, String file) {
    if (raw == null) {
      throw new IllegalStateException("Empty entry file " + file);
    }
    var examples = new ArrayList<Example>();
    for (var e : list(raw.get("examples"))) {
      var m = (Map<String, Object>) e;
      examples.add(
          new Example(
              s(m.get("title")),
              s(m.get("description")),
              s(m.get("yaml")),
              s(m.get("java")),
              s(m.get("route")),
              s(m.get("embed"))));
    }
    var pages = new ArrayList<Page>();
    for (var p : list(raw.get("pages"))) {
      var m = (Map<String, Object>) p;
      pages.add(new Page(s(m.get("route")), s(m.get("layout")), s(m.get("viewModel"))));
    }
    var code = new ArrayList<CodeFile>();
    for (var c : list(raw.get("code"))) {
      var m = (Map<String, Object>) c;
      var path = s(m.get("path"));
      code.add(new CodeFile(s(m.get("label")), path, languageOf(path)));
    }
    var covers = list(raw.get("covers")).stream().map(Object::toString).toList();
    return new Entry(
        required(raw, "id", file),
        required(raw, "area", file),
        required(raw, "group", file),
        required(raw, "title", file),
        covers,
        s(raw.get("description")),
        s(raw.get("doc")),
        List.copyOf(examples),
        List.copyOf(pages),
        List.copyOf(code),
        s(raw.get("notDemonstrable")),
        s(raw.get("knownIssue")),
        list(raw.get("probeAllows")).stream().map(Object::toString).toList(),
        file);
  }

  private static String required(Map<String, Object> raw, String key, String file) {
    var v = s(raw.get(key));
    if (v == null || v.isBlank()) {
      throw new IllegalStateException("Entry " + file + " has no '" + key + "'");
    }
    return v;
  }

  private static List<Object> list(Object o) {
    return o instanceof List<?> l ? (List<Object>) l : List.of();
  }

  private static String s(Object o) {
    return o == null ? null : o.toString();
  }
}
