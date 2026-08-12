package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RouteRegistry;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Route resolution consults the AUTHORED registry before the annotation-derived providers.
 *
 * <p>The three behaviours that matter: an authored route wins and carries its parameters, a route
 * the registry does not mention falls through untouched (so every existing app keeps working), and
 * an entry that cannot be honoured — no view model, or a class that is not on the classpath — falls
 * through instead of failing the request.
 */
class RoutedClassResolverRegistryTest {

  private final DefaultRoutedClassResolver resolver =
      new DefaultRoutedClassResolver(List.of(), new RouteRegistry());

  @Test
  void anAuthoredRouteResolvesToItsViewModel() {
    var resolved = resolver.resolve("tickets/open", null).orElseThrow();
    assertThat(resolved.resolvedClass()).isEqualTo(RegistryRoutedViews.Tickets.class);
    assertThat(resolved.pattern()).isEqualTo("tickets/open");
  }

  @Test
  void twoRoutesOverOneViewModelCarryTheParameterEachOnePins() {
    // The case an annotation cannot express: same class, different pinned scope.
    assertThat(resolver.resolve("tickets/open", null).orElseThrow().params())
        .containsEntry("status", "open");
    assertThat(resolver.resolve("tickets/closed", null).orElseThrow().params())
        .containsEntry("status", "closed");
  }

  @Test
  void aRouteTheRegistryDoesNotMentionFallsThroughToTheProviders() {
    // No providers here, so falling through means resolving to nothing — which is exactly what
    // proves the registry did not answer.
    assertThat(resolver.resolve("something/unrelated", null)).isEmpty();
  }

  @Test
  void anEntryWithNoViewModelFallsThroughRatherThanResolving() {
    // `about` is declared with a definition and no view model: a statically deployed route has no
    // server class to instantiate.
    assertThat(resolver.resolve("about", null)).isEmpty();
  }

  @Test
  void anEntryNamingAClassThatIsNotOnTheClasspathFallsThroughInsteadOfFailing() {
    assertThat(resolver.resolve("broken", null)).isEmpty();
  }

  @Test
  void annotationResolvedRoutesCarryNoParameters() {
    assertThat(new ResolvedRoute("x", "x", String.class).params()).isEmpty();
  }
}
