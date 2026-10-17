package io.mateu.uidl.annotations;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

/**
 * Every public annotation of {@code io.mateu.uidl.annotations} declares where it may go: a missing
 * {@code @Target} makes it legal on ANY element, and adding one later is source-incompatible for
 * whoever relied on that. It must also be composable (the "semantic annotations" rule: usable as a
 * meta-annotation), visible at runtime (the framework reads it reflectively) and
 * {@code @Documented} (so it shows in the Javadoc of the element carrying it).
 *
 * <p>Annotations that only exist as a member value of another one ({@code @Zone} inside {@code
 * Zones}) declare an EMPTY {@code @Target}: they cannot be put on any declaration.
 */
class AnnotationDeclarationsTest {

  private static final Path SOURCES = Path.of("src/main/java/io/mateu/uidl/annotations");

  static List<Class<?>> annotations() throws IOException {
    var out = new ArrayList<Class<?>>();
    try (Stream<Path> files = Files.list(SOURCES)) {
      for (var file : files.filter(p -> p.toString().endsWith(".java")).sorted().toList()) {
        var name = file.getFileName().toString().replace(".java", "");
        try {
          var type = Class.forName("io.mateu.uidl.annotations." + name);
          if (type.isAnnotation() && !type.isAnnotationPresent(Deprecated.class)) {
            out.add(type);
          }
        } catch (ClassNotFoundException e) {
          throw new AssertionError(name, e);
        }
      }
    }
    return out;
  }

  @Test
  void everyAnnotationDeclaresItsTargetsAndIsComposable() throws IOException {
    var offenders = new ArrayList<String>();
    for (var type : annotations()) {
      var target = type.getAnnotation(Target.class);
      if (target == null) {
        offenders.add(type.getSimpleName() + ": no @Target");
        continue;
      }
      var targets = Arrays.asList(target.value());
      if (targets.isEmpty()) {
        continue; // member-only (e.g. @Zone inside @Zones)
      }
      if (!targets.contains(ElementType.ANNOTATION_TYPE) && !targets.contains(ElementType.TYPE)) {
        offenders.add(type.getSimpleName() + ": not composable (no ANNOTATION_TYPE)");
      }
      var retention = type.getAnnotation(Retention.class);
      if (retention == null || retention.value() != RetentionPolicy.RUNTIME) {
        offenders.add(type.getSimpleName() + ": not retained at runtime");
      }
    }
    assertThat(offenders).isEmpty();
  }

  @Test
  void everyAnnotationIsDocumented() throws IOException {
    var undocumented =
        annotations().stream()
            .filter(type -> !type.isAnnotationPresent(Documented.class))
            .map(Class::getSimpleName)
            .toList();
    assertThat(undocumented).isEmpty();
  }

  @Test
  void theKeyAnnotationsExplainThemselves() throws IOException {
    for (var name : List.of("Action", "App", "Menu", "Toolbar", "Button", "KPI", "Status")) {
      var source = Files.readString(SOURCES.resolve(name + ".java"));
      var head = source.substring(0, source.indexOf("public @interface"));
      assertThat(head).as(name + " has a type Javadoc").contains("/**");
      assertThat(head).as(name).doesNotContain("Created by");
    }
  }

  @Test
  void theDeadListAnnotationIsDeprecated() {
    assertThat(io.mateu.uidl.annotations.List.class.isAnnotationPresent(Deprecated.class)).isTrue();
  }
}
