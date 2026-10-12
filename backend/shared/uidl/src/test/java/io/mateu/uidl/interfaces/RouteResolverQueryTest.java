package io.mateu.uidl.interfaces;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.RouteConstants;
import java.util.List;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/**
 * A route that carries a query string — a listing opened from a deep link with its filters, page
 * and sort — is the same route. The pattern-based resolvers (the WebFlux, Quarkus and Helidon
 * adapters generate them) matched the whole string, missed, and the root ui answered instead.
 */
class RouteResolverQueryTest {

  private final RouteResolver books =
      new RouteResolver() {
        @Override
        public Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest) {
          return String.class;
        }

        @Override
        public List<CompiledRouteValue> supportedRoutesPatterns() {
          return List.of(
              new CompiledRouteValue(
                  "/books",
                  RouteConstants.NO_PARENT_ROUTE,
                  Pattern.compile("/books(/.*)?"),
                  Pattern.compile("_empty")));
        }
      };

  @Test
  void aRouteWithAQueryStringMatchesItsPattern() {
    assertThat(books.supportsRoute("/books?genre=NOVEL", RouteConstants.NO_PARENT_ROUTE)).isTrue();
    assertThat(
            books.supportsRoute(
                "/books/?page=1&sort=pages:descending", RouteConstants.NO_PARENT_ROUTE))
        .isTrue();
  }

  @Test
  void theQueryDoesNotMakeAnotherRouteMatch() {
    assertThat(books.supportsRoute("/authors?q=/books", RouteConstants.NO_PARENT_ROUTE)).isFalse();
  }
}
