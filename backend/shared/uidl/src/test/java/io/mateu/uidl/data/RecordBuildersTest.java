package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * A public uidl record with three or more components is built with a builder, not positionally: a
 * positional constructor breaks every caller the next time the record grows a component (which is
 * how {@code RouteEntry} ended up with five hand-kept overloads). Smaller value pairs ({@code
 * Sort(field, direction)}) stay positional.
 */
class RecordBuildersTest {

  private static final Path ROOT = Path.of("src/main/java");

  @Test
  void everyRecordWithThreeOrMoreComponentsHasABuilder() throws IOException {
    var missing = new ArrayList<String>();
    try (Stream<Path> files = Files.walk(ROOT)) {
      for (var file : files.filter(p -> p.toString().endsWith(".java")).sorted().toList()) {
        var source = Files.readString(file);
        if (!source.contains("public record ")) continue;
        var name =
            ROOT.relativize(file)
                .toString()
                .replace(".java", "")
                .replace('/', '.')
                .replace('\\', '.');
        Class<?> type;
        try {
          type = Class.forName(name);
        } catch (ClassNotFoundException e) {
          continue;
        }
        if (!type.isRecord() || !Modifier.isPublic(type.getModifiers())) continue;
        if (type.getRecordComponents().length < 3) continue;
        boolean hasBuilder;
        try {
          hasBuilder = Modifier.isStatic(type.getMethod("builder").getModifiers());
        } catch (NoSuchMethodException e) {
          hasBuilder = false;
        }
        if (!hasBuilder) missing.add(name);
      }
    }
    assertThat(missing).isEmpty();
  }

  @Test
  void aBuiltRouteEntryIsNormalisedLikeAPositionalOne() {
    var built = RouteEntry.builder().route("orders/pending").viewModel("com.acme.Orders").build();
    assertThat(built)
        .isEqualTo(new RouteEntry("orders/pending", null, "com.acme.Orders", null, null));
    assertThat(built.fixedParams()).isEmpty();
    assertThat(built.children()).isEmpty();
    assertThat(RouteEntry.builder().build().route()).isEmpty();
    assertThat(
            RouteEntry.builder()
                .route("x")
                .fixedParams(Map.of("status", "pending"))
                .build()
                .resolveParams(Map.of("status", "other")))
        .containsEntry("status", "pending");
  }
}
