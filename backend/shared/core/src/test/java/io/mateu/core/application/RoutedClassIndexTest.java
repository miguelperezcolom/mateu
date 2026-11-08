package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The route index answers exactly what asking every routed class answered (perf follow-up,
 * 2026-11): same matches, same order.
 */
class RoutedClassIndexTest {

  static final List<String> PATTERNS =
      List.of(
          "",
          "/",
          "/a",
          "/a/",
          "/a/b",
          "a/b",
          "/a//b",
          "/v1.0",
          "/a/:id",
          "/:x",
          "/a/:id/edit",
          "/a.b",
          "/A");

  static final List<String> ROUTES =
      List.of(
          "",
          "/",
          "/a",
          "/a/",
          "/a/b",
          "a/b",
          "/a//b",
          "/v1.0",
          "/v1x0",
          "/a/7",
          "/a/7/edit",
          "/q",
          "/a.b",
          "/axb",
          "/A",
          "//",
          "/a/b/c");

  @Test
  void aRouteWithoutParametersMatchesExactlyItsLiteralKey() {
    for (var pattern : PATTERNS) {
      if (RoutedClassIndex.isParameterised(pattern)) {
        continue;
      }
      for (var route : ROUTES) {
        assertThat(RoutedClassIndex.literalKey(pattern).equals(route))
            .as("pattern '%s' vs route '%s'", pattern, route)
            .isEqualTo(RouteAnnotationMatcher.matches(route, pattern));
      }
    }
  }

  @UI("/a")
  static class A1 {}

  @UI("/a/:id")
  static class AParam {}

  @UI("/a")
  static class A2 {}

  @UI("/b")
  static class B {}

  static class NotRouted {}

  @Test
  void candidatesComeBackInTheProvidersOrderWhateverTheLookup() {
    List<RoutedClassProvider> providers =
        List.of(
            () -> NotRouted.class,
            () -> AParam.class,
            () -> A1.class,
            () -> {
              throw new NoClassDefFoundError("gone");
            },
            () -> B.class,
            () -> A2.class);
    var index = new RoutedClassIndex(providers);
    assertThat(index.matching("/a", null))
        .extracting(RoutedClassIndex.Entry::type)
        .containsExactly(A1.class, A2.class);
    assertThat(index.matching("/a/7", null))
        .extracting(RoutedClassIndex.Entry::type)
        .containsExactly(AParam.class);
    // the second key compares by equality with the DECLARED route, parameters included
    assertThat(index.matching("/x", "/a/:id"))
        .extracting(RoutedClassIndex.Entry::type)
        .containsExactly(AParam.class);
    assertThat(index.matching("/b", "/a"))
        .extracting(RoutedClassIndex.Entry::type)
        .containsExactly(A1.class, B.class, A2.class);
    assertThat(index.matching("/c", null)).isEmpty();
  }
}
