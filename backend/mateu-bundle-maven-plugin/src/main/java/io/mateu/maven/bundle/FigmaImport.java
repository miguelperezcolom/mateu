package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The pure rules of "Import from Figma", shared in spirit with the IntelliJ plugin ({@code
 * FigmaImport.kt}) and the VS Code extension ({@code figmaImport.ts}, the REFERENCE) and pinned for
 * the three by {@code conformance/client/figma-import.json}: a Figma URL → the file key, which
 * routes file gets the imported pages, the minimal routes.yaml append — plus where the token and
 * {@code node} come from. The conversion itself is never re-implemented here: it is {@code
 * design/figma/import/figma-import.mjs}, run with node.
 */
final class FigmaImport {

  static final int MIN_NODE_MAJOR = 20;

  static final String TOKEN_HELP =
      "Create a personal access token in Figma (Settings › Security › Personal access tokens) with"
          + " the scope \"File content: Read only\", then put it in the FIGMA_TOKEN environment"
          + " variable or in ~/.mateu-secrets/figma-token (or ~/.config/mateu/figma-token).";

  private static final Pattern URL =
      Pattern.compile(
          "^(?:https?://)?(?:[\\w-]+\\.)?figma\\.com/(?:file|design|proto|board|slides|deck)/([A-Za-z0-9]+)(?:/[^/?#]*)?(?:/branch/([A-Za-z0-9]+))?");
  private static final Pattern KEY = Pattern.compile("^[A-Za-z0-9]{6,}$");
  private static final Pattern MARKER = Pattern.compile("^(\\s*)#\\s*__ROUTES__\\s*$");
  private static final Pattern PLAIN = Pattern.compile("^[\\p{L}\\p{N}][\\p{L}\\p{N} ._'()/-]*$");
  private static final java.util.Set<String> RESERVED =
      java.util.Set.of("true", "false", "yes", "no", "on", "off", "null", "y", "n");

  private static final ObjectMapper YAML = new ObjectMapper(new YAMLFactory());

  private FigmaImport() {}

  /**
   * The file key of a Figma URL ({@code …/design/<key>/<name>?node-id=…}, {@code /file/}, {@code
   * /proto/}; a branch URL → the BRANCH key) or of a bare key.
   */
  static String fileKey(String input) {
    var s = input == null ? "" : input.trim();
    Matcher m = URL.matcher(s);
    if (m.find()) return m.group(2) != null ? m.group(2) : m.group(1);
    if (KEY.matcher(s).matches()) return s;
    throw new IllegalArgumentException(
        "Not a Figma file URL or key: \""
            + s
            + "\" (expected https://www.figma.com/design/<key>/…)");
  }

  /** The route an imported page answers: its path under the specs root without {@code .yaml}. */
  static String routeOfPage(String path) {
    return path.replace('\\', '/').replaceAll("\\.ya?ml$", "");
  }

  /** {@code routes.yaml} when it is a routes file, else the first routes file in path order. */
  static Optional<String> routesFileFor(List<String> routesFiles) {
    if (routesFiles.contains("routes.yaml")) return Optional.of("routes.yaml");
    return routesFiles.stream().sorted().findFirst();
  }

  /**
   * Register an imported page: before a {@code # __ROUTES__} marker line when there is one (at its
   * indentation), else at the end of the {@code routes:} list — a minimal text edit. Empty when the
   * route is already declared.
   */
  static Optional<String> appendImportedRoute(String text, String route, String layout) {
    var r = trimSlashes(route);
    if (existingRoutes(text).contains(r)) return Optional.empty();
    var nl = text.contains("\r\n") ? "\r\n" : "\n";
    var lines = new ArrayList<>(List.of(text.split("\r?\n", -1)));
    for (int i = 0; i < lines.size(); i++) {
      Matcher m = MARKER.matcher(lines.get(i));
      if (m.matches()) {
        var indent = m.group(1);
        lines.add(i, indent + "  layout: " + scalar(layout));
        lines.add(i, indent + "- route: " + scalar(r));
        return Optional.of(String.join(nl, lines));
      }
    }
    return Optional.of(
        appendListItem(text, "routes", List.of(List.of("route", r), List.of("layout", layout))));
  }

  /** The routes a routes file already declares, children joined to their parent. */
  static List<String> existingRoutes(String text) {
    Object root;
    try {
      root = YAML.readValue(text, Object.class);
    } catch (IOException e) {
      return List.of();
    }
    Object list = root instanceof Map<?, ?> map ? map.get("routes") : root;
    var out = new ArrayList<String>();
    if (list instanceof List<?> entries) walk(entries, null, out);
    return out;
  }

  private static void walk(List<?> entries, String prefix, List<String> out) {
    for (var e : entries) {
      if (!(e instanceof Map<?, ?> m) || m.get("route") == null) continue;
      var r = String.valueOf(m.get("route"));
      var abs = prefix == null || prefix.isEmpty() ? r : r.isEmpty() ? prefix : prefix + "/" + r;
      out.add(abs);
      if (m.get("children") instanceof List<?> children) walk(children, abs, out);
    }
  }

  /** Whether a YAML text's top-level {@code type:} is {@code Routes}. */
  static boolean isRoutesFile(String text) {
    try {
      return YAML.readValue(text, Object.class) instanceof Map<?, ?> m
          && "Routes".equals(String.valueOf(m.get("type")));
    } catch (IOException e) {
      return false;
    }
  }

  /** An empty routes file — identical to the IDEs' New › Mateu › Routes File. */
  static String routesFileText() {
    return "# Route registry of a mount. Each entry binds a route (relative to the mount; \"\" is its root)\n"
        + "# to a layout under specs/ui, an optional viewModel, and parameters it pins (fixedParams) or\n"
        + "# seeds (defaultParams); `children` nest sub-routes in a parent's slot. Add entries with\n"
        + "# Add Route…, see https://mateu.io/concepts/routes-and-mounts/\n"
        + "type: Routes\n"
        + "routes: []\n";
  }

  /** The specs/ui root containing {@code dir}, or {@code dir} itself when it is not under one. */
  static Path specsRoot(Path dir) {
    var path = dir.toAbsolutePath().normalize().toString().replace('\\', '/');
    var i = path.indexOf("/specs/ui/");
    return i >= 0
        ? Path.of(path.substring(0, i + "/specs/ui".length()))
        : dir.toAbsolutePath().normalize();
  }

  // ── token + node ────────────────────────────────────────────────────────────────────────────

  /**
   * {@code FIGMA_TOKEN}, else {@code ~/.mateu-secrets/figma-token}, else {@code
   * ~/.config/mateu/figma-token}.
   */
  static Optional<String> token(Map<String, String> env, Path home) {
    var fromEnv = env.get("FIGMA_TOKEN");
    if (fromEnv != null && !fromEnv.isBlank()) return Optional.of(fromEnv.trim());
    for (var p :
        List.of(
            home.resolve(".mateu-secrets/figma-token"),
            home.resolve(".config/mateu/figma-token"))) {
      try {
        if (Files.isRegularFile(p)) {
          var t = Files.readString(p).trim();
          if (!t.isEmpty()) return Optional.of(t);
        }
      } catch (IOException e) {
        // unreadable: try the next one
      }
    }
    return Optional.empty();
  }

  /**
   * The {@code node} executables to try, in order: the configured one, then each PATH entry, then
   * the usual install folders (an IDE or a GUI-launched Maven may not inherit the shell's PATH).
   */
  static List<Path> nodeCandidates(String configured, Map<String, String> env, Path home) {
    var out = new LinkedHashSet<Path>();
    if (configured != null && !configured.isBlank()) {
      out.add(Path.of(configured.trim()));
      return List.copyOf(out);
    }
    var windows = System.getProperty("os.name", "").toLowerCase().contains("win");
    var names = windows ? List.of("node.exe", "node.cmd") : List.of("node");
    var dirs = new ArrayList<String>();
    var path = env.getOrDefault("PATH", env.getOrDefault("Path", ""));
    for (var d : path.split(File.pathSeparator)) if (!d.isBlank()) dirs.add(d);
    dirs.addAll(
        List.of(
            "/opt/homebrew/bin",
            "/usr/local/bin",
            "/usr/bin",
            home.resolve(".volta/bin").toString()));
    for (var d : dirs) for (var n : names) out.add(Path.of(d, n));
    return List.copyOf(out);
  }

  /** {@code v20.11.1} → 20; empty when it does not read as a node version. */
  static Optional<Integer> nodeMajor(String version) {
    Matcher m = Pattern.compile("^v?(\\d+)\\.").matcher(version == null ? "" : version.trim());
    return m.find() ? Optional.of(Integer.parseInt(m.group(1))) : Optional.empty();
  }

  // ── minimal YAML list append (a port of the IDEs' MateuRoutes.appendListItem) ──────────────────

  private static String trimSlashes(String s) {
    return s.trim().replaceAll("^/+|/+$", "");
  }

  static String scalar(String s) {
    if (s.isEmpty()) return "\"\"";
    var plain =
        s.equals(s.trim()) && PLAIN.matcher(s).matches() && !RESERVED.contains(s.toLowerCase());
    return plain ? s : "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }

  private static List<String> blockLines(List<List<String>> entries, String indent) {
    var out = new ArrayList<String>();
    for (int i = 0; i < entries.size(); i++) {
      var e = entries.get(i);
      out.add((i == 0 ? indent + "- " : indent + "  ") + e.get(0) + ": " + scalar(e.get(1)));
    }
    return out;
  }

  private static String flow(List<List<String>> entries) {
    var parts = new ArrayList<String>();
    for (var e : entries) parts.add(e.get(0) + ": " + scalar(e.get(1)));
    return "{" + String.join(", ", parts) + "}";
  }

  static String appendListItem(String text, String key, List<List<String>> entries) {
    var nl = text.contains("\r\n") ? "\r\n" : "\n";
    var lines = new ArrayList<>(List.of(text.split("\r?\n", -1)));
    var trailingNewline = text.endsWith("\n");
    if (trailingNewline) lines.remove(lines.size() - 1);
    var keyRe = Pattern.compile("^" + Pattern.quote(key) + "\\s*:(.*)$");
    int idx = -1;
    for (int i = 0; i < lines.size(); i++) {
      if (keyRe.matcher(lines.get(i)).matches()) {
        idx = i;
        break;
      }
    }
    if (idx < 0) {
      while (!lines.isEmpty() && lines.get(lines.size() - 1).isBlank())
        lines.remove(lines.size() - 1);
      lines.add(key + ":");
      lines.addAll(blockLines(entries, "  "));
      return String.join(nl, lines) + nl;
    }
    Matcher km = keyRe.matcher(lines.get(idx));
    km.matches();
    var rest = km.group(1);
    var value = stripComment(rest).trim();
    if (value.isEmpty()) {
      int last = idx;
      String itemIndent = null;
      for (int j = idx + 1; j < lines.size(); j++) {
        var l = lines.get(j);
        if (l.isBlank() || l.stripLeading().startsWith("#")) continue;
        var belongs =
            l.startsWith(" ") || l.startsWith("\t") || l.startsWith("- ") || l.equals("-");
        if (!belongs) break;
        if (itemIndent == null && l.stripLeading().startsWith("-"))
          itemIndent = l.substring(0, l.length() - l.stripLeading().length());
        last = j;
      }
      lines.addAll(last + 1, blockLines(entries, itemIndent == null ? "  " : itemIndent));
    } else if (value.startsWith("[") && value.endsWith("]")) {
      var inner = value.substring(1, value.length() - 1).trim();
      var c = rest.substring(stripComment(rest).length()).trim();
      var comment = c.isEmpty() ? "" : " " + c;
      if (inner.isEmpty()) {
        lines.set(idx, key + ":" + comment);
        lines.addAll(idx + 1, blockLines(entries, "  "));
      } else {
        lines.set(idx, key + ": [" + inner + ", " + flow(entries) + "]" + comment);
      }
    } else {
      throw new IllegalArgumentException(
          "`"
              + key
              + ":` is not a list this tool can edit ("
              + value.substring(0, Math.min(30, value.length()))
              + ")");
    }
    return String.join(nl, lines) + (trailingNewline ? nl : "");
  }

  private static String stripComment(String s) {
    Character quote = null;
    for (int i = 0; i < s.length(); i++) {
      var c = s.charAt(i);
      if (quote != null) {
        if (c == quote) quote = null;
      } else if (c == '"' || c == '\'') {
        quote = c;
      } else if (c == '#' && (i == 0 || Character.isWhitespace(s.charAt(i - 1)))) {
        return s.substring(0, i);
      }
    }
    return s;
  }
}
