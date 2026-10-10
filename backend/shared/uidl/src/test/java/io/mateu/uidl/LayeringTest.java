package io.mateu.uidl;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * The layering of the public modules (see reference/stability-and-versioning.md, "Module
 * layering"):
 *
 * <ul>
 *   <li>{@code mateu-dtos} (the wire) depends on nothing Mateu;
 *   <li>{@code mateu-uidl} (the authoring API) reaches the wire ONLY through a closed set of
 *       wire-boundary types — the escape hatches that hand Mateu a ready-made wire object, the
 *       request accessors and the long-task stream. Anything else importing {@code io.mateu.dtos}
 *       is an accidental coupling and fails here;
 *   <li>{@code mateu-core} depends on both.
 * </ul>
 *
 * <p>Shrinking the allow-list is always welcome; growing it is a reviewed API decision.
 */
class LayeringTest {

  private static final Pattern DTOS = Pattern.compile("\\bio\\.mateu\\.dtos\\b");
  private static final Pattern UPPER_LAYERS =
      Pattern.compile("\\bio\\.mateu\\.(uidl|core)\\.[a-z]");

  /** The uidl types allowed to reference the wire DTOs (relative to src/main/java). */
  private static final Set<String> WIRE_BOUNDARY =
      Set.of(
          // escape hatches: the author returns a wire object Mateu renders as-is
          "io/mateu/uidl/interfaces/DtoSupplier.java",
          "io/mateu/uidl/interfaces/MapsToDto.java",
          "io/mateu/uidl/data/CardRow.java",
          // the request as received (RunActionRqDto / GetUIRqDto)
          "io/mateu/uidl/interfaces/HttpRequest.java",
          "io/mateu/uidl/interfaces/SearchableSelection.java",
          // LongTask streams wire increments over SSE
          "io/mateu/uidl/data/LongTask.java",
          "io/mateu/uidl/data/ProgressReporter.java");

  @Test
  void uidlReachesTheWireOnlyThroughTheBoundaryTypes() throws IOException {
    var root = Path.of("src/main/java");
    var offenders = new TreeSet<String>();
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
        var rel = root.relativize(file).toString().replace('\\', '/');
        if (WIRE_BOUNDARY.contains(rel)) {
          continue;
        }
        if (DTOS.matcher(codeOf(file)).find()) {
          offenders.add(rel);
        }
      }
    }
    assertThat(offenders).as("uidl types coupled to the wire DTOs").isEmpty();
  }

  @Test
  void uidlDoesNotReachIntoCore() throws IOException {
    var root = Path.of("src/main/java");
    var core = Pattern.compile("\\bio\\.mateu\\.core\\.[a-z]");
    var offenders = new TreeSet<String>();
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
        if (core.matcher(codeOf(file)).find()) {
          offenders.add(root.relativize(file).toString());
        }
      }
    }
    assertThat(offenders).as("uidl types referencing core").isEmpty();
  }

  @Test
  void theBoundaryListHasNoStaleEntries() {
    var root = Path.of("src/main/java");
    for (String rel : WIRE_BOUNDARY) {
      assertThat(root.resolve(rel)).as("allow-listed wire-boundary type").exists();
    }
  }

  @Test
  void dtosDependOnNothingMateu() throws IOException {
    var root = Path.of("../dtos/src/main/java");
    assertThat(root).exists();
    var offenders = new TreeSet<String>();
    try (Stream<Path> files = Files.walk(root)) {
      for (Path file : files.filter(p -> p.toString().endsWith(".java")).toList()) {
        if (UPPER_LAYERS.matcher(codeOf(file)).find()) {
          offenders.add(root.relativize(file).toString());
        }
      }
    }
    assertThat(offenders).as("wire DTOs importing the authoring API or core").isEmpty();
  }

  /** The source without comments, so a Javadoc mention is not a dependency. */
  private static String codeOf(Path file) throws IOException {
    var text = Files.readString(file);
    return text.replaceAll("(?s)/\\*.*?\\*/", "").replaceAll("//[^\\n]*", "");
  }
}
