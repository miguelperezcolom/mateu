package io.mateu.uidl;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * The deprecation policy (reference/stability-and-versioning.md, "Deprecation policy"): a
 * deprecation always names its replacement. Every {@code @Deprecated} element of the public Java
 * surface — {@code mateu-uidl}, {@code mateu-dtos} and core's archetypes — must:
 *
 * <ul>
 *   <li>say since when ({@code @Deprecated(since = "…")}), so the one-minor overlap can be checked;
 *   <li>carry a Javadoc {@code @deprecated} tag right above it that names the replacement — a
 *       {@code {@link …}} / {@code {@code …}} reference — or says explicitly that there is none
 *       ("No replacement" / "nothing replaces it"), so a user is never left guessing.
 * </ul>
 */
class DeprecationsNameTheirReplacementTest {

  /** The public Java surface, relative to this module (backend/shared/uidl). */
  private static final List<Path> PUBLIC_SOURCES =
      List.of(
          Path.of("src/main/java"),
          Path.of("../dtos/src/main/java"),
          Path.of("../core/src/main/java/io/mateu/core/infra/declarative/orchestrators"));

  private static final Pattern DEPRECATED = Pattern.compile("@Deprecated\\b(\\([^)]*\\))?");
  private static final Pattern NAMES_A_REPLACEMENT =
      Pattern.compile(
          "\\{@(link|linkplain|code) [^}]+}|(?i)no replacement|nothing replaces it",
          Pattern.DOTALL);

  @Test
  void everyDeprecationSaysSinceWhenAndNamesItsReplacement() throws IOException {
    var offenders = new ArrayList<String>();
    int seen = 0;
    for (Path root : PUBLIC_SOURCES) {
      try (Stream<Path> files = Files.walk(root)) {
        for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
          var source = Files.readString(file);
          Matcher m = DEPRECATED.matcher(source);
          while (m.find()) {
            if (inAComment(source, m.start())) continue;
            seen++;
            var where = file + ":" + lineOf(source, m.start());
            var args = m.group(1) == null ? "" : m.group(1);
            if (!args.contains("since")) {
              offenders.add(where + " — @Deprecated without since = \"…\"");
            }
            var tag = deprecatedTagAbove(source, m.start());
            if (tag == null) {
              offenders.add(where + " — no Javadoc @deprecated tag right above it");
            } else if (!NAMES_A_REPLACEMENT.matcher(tag).find()) {
              offenders.add(where + " — its @deprecated tag names no replacement: " + tag.trim());
            }
          }
        }
      }
    }
    assertThat(seen).as("the scan found the deprecations at all").isPositive();
    assertThat(offenders).as("deprecations breaking the policy").isEmpty();
  }

  /**
   * The text of the {@code @deprecated} tag of the Javadoc directly above {@code at} (only
   * annotations and blank space may sit between them), or null.
   */
  private static String deprecatedTagAbove(String source, int at) {
    int end = source.lastIndexOf("*/", at);
    if (end < 0) return null;
    var between = source.substring(end + 2, at);
    // only annotations (possibly multi-line, e.g. @JsonSubTypes({...})) and whitespace in between
    var stripped = between.replaceAll("(?s)@[\\w.]+(\\((?:[^()]|\\([^()]*\\))*\\))?", "").trim();
    if (!stripped.isEmpty()) return null;
    int start = source.lastIndexOf("/**", end);
    if (start < 0) return null;
    var javadoc = source.substring(start, end);
    int tag = javadoc.indexOf("@deprecated");
    if (tag < 0) return null;
    return javadoc.substring(tag + "@deprecated".length()).replaceAll("\\n\\s*\\*", " ");
  }

  /** A mention in Javadoc or a line comment, not an annotation. */
  private static boolean inAComment(String source, int offset) {
    int lineStart = source.lastIndexOf('\n', offset) + 1;
    var before = source.substring(lineStart, offset).trim();
    return before.startsWith("*")
        || before.startsWith("/*")
        || before.contains("//")
        || before.contains("{@");
  }

  private static int lineOf(String source, int offset) {
    int line = 1;
    for (int i = 0; i < offset; i++) {
      if (source.charAt(i) == '\n') line++;
    }
    return line;
  }
}
