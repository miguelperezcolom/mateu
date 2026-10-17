package io.mateu.core.architecture;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * The hexagonal layering INSIDE core, as a ratchet.
 *
 * <ul>
 *   <li>{@code domain} should depend on neither {@code application} nor {@code infra};
 *   <li>{@code application} should not depend on {@code infra}.
 * </ul>
 *
 * Today both leak, so the files that do are listed in {@code core-layering-allowlist.txt} (one
 * {@code <layer> -> <layer>: <file>} per line). A file joining the list fails here — a new
 * dependency against the layering is a reviewed decision, not an accident. A listed file that no
 * longer leaks fails too, so the list only ever shrinks: remove its line.
 *
 * <p>Allowed everywhere, as utilities rather than adapters: the reflection readers ({@code
 * infra.reflection.read}) and the {@link #UTILITIES}, which depend on nothing of core's (pinned
 * below, so the classification stays honest). The public archetypes under {@code
 * infra.declarative.orchestrators} cannot move (they are public API), which is why most of the
 * remaining domain → infra entries stay.
 */
class CoreLayeringTest {

  private static final Path ROOT = Path.of("src/main/java");
  private static final String CORE = "io/mateu/core/";
  private static final String ALLOWLIST = "/architecture/core-layering-allowlist.txt";

  private static final Pattern APPLICATION =
      Pattern.compile("\\bio\\.mateu\\.core\\.application\\.");

  /** Infra classes that are plain utilities: no dependency on anything of core's. */
  static final Set<String> UTILITIES =
      Set.of(
          "io/mateu/core/infra/Slashes.java",
          "io/mateu/core/infra/reflection/ClassLoaders.java",
          "io/mateu/core/infra/reflection/MetaAnnotations.java");

  /** A reference into infra that is neither the reflection readers nor a utility. */
  private static final Pattern INFRA =
      Pattern.compile(
          "\\bio\\.mateu\\.core\\.infra\\.(?!reflection\\.read\\.|Slashes\\b"
              + "|reflection\\.ClassLoaders\\b|reflection\\.MetaAnnotations\\b)");

  private static final Pattern ANY_CORE = Pattern.compile("\\bio\\.mateu\\.core\\.");

  @Test
  void coreLayersDoNotLeakBeyondTheAllowList() throws IOException {
    var actual = leaks();
    var allowed = allowList();

    var added = new TreeSet<>(actual);
    added.removeAll(allowed);
    var gone = new TreeSet<>(allowed);
    gone.removeAll(actual);

    assertThat(added)
        .as(
            "new dependencies against core's layering (domain -> application/infra, application ->"
                + " infra); depend inwards instead, or add the line to %s as a reviewed decision",
            ALLOWLIST)
        .isEmpty();
    assertThat(gone)
        .as("these files no longer leak: remove their lines from %s", ALLOWLIST)
        .isEmpty();
  }

  @Test
  void theUtilitiesDependOnNothingOfCore() throws IOException {
    for (var utility : UTILITIES) {
      var code = codeOf(ROOT.resolve(utility)).replaceFirst("(?m)^package [^;]+;", "");
      assertThat(ANY_CORE.matcher(code).find())
          .as("%s is allowed everywhere only while it depends on nothing of core's", utility)
          .isFalse();
    }
  }

  @Test
  void theAllowListHasNoDuplicatesAndIsSorted() throws IOException {
    var lines = lines();
    assertThat(lines).doesNotHaveDuplicates();
    assertThat(lines).isSorted();
  }

  static Set<String> leaks() throws IOException {
    var leaks = new TreeSet<String>();
    try (Stream<Path> files = Files.walk(ROOT.resolve(CORE))) {
      for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
        var rel = ROOT.relativize(file).toString().replace('\\', '/');
        var layer = rel.substring(CORE.length()).split("/")[0];
        var code = codeOf(file);
        if ("domain".equals(layer)) {
          if (APPLICATION.matcher(code).find()) {
            leaks.add("domain -> application: " + rel);
          }
          if (INFRA.matcher(code).find()) {
            leaks.add("domain -> infra: " + rel);
          }
        } else if ("application".equals(layer) && INFRA.matcher(code).find()) {
          leaks.add("application -> infra: " + rel);
        }
      }
    }
    return leaks;
  }

  private static Set<String> allowList() throws IOException {
    return new TreeSet<>(lines());
  }

  private static java.util.List<String> lines() throws IOException {
    try (var in = Objects.requireNonNull(CoreLayeringTest.class.getResourceAsStream(ALLOWLIST))) {
      return new String(in.readAllBytes(), StandardCharsets.UTF_8)
          .lines()
          .map(String::strip)
          .filter(line -> !line.isEmpty() && !line.startsWith("#"))
          .collect(Collectors.toList());
    }
  }

  /** The source without its comments: a Javadoc {@code @link} is not a dependency. */
  private static String codeOf(Path file) throws IOException {
    var text = Files.readString(file);
    return text.replaceAll("(?s)/\\*.*?\\*/", "").replaceAll("//[^\\n]*", "");
  }
}
