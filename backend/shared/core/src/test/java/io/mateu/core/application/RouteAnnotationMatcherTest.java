package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RunActionCommand;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Routes;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Route pattern matching: @UI absolute routes, :param segments, @Route parentRoute gating against
 * the consumed route, per-ui restriction, and multi-@Routes declarations.
 */
class RouteAnnotationMatcherTest {

  @UI("/products")
  static class ProductsPage {}

  @UI("/orders/:id")
  static class OrderPage {}

  @Route(value = "/detail", parentRoute = "/host")
  static class HostedDetail {}

  @Routes({@Route(value = "/a"), @Route(value = "/b/:key")})
  static class MultiRouted {}

  private static RunActionCommand command(String route, String consumedRoute) {
    return new RunActionCommand(
        "", "", route, consumedRoute, "", Map.of(), Map.of(), null, null, null, null);
  }

  @Test
  void uiRouteMatchesExactly() {
    var resolved =
        RouteAnnotationMatcher.matchesAbsolute(
            "/products", ProductsPage.class, command("/products", "_empty"));
    assertThat(resolved).isPresent();
    assertThat(resolved.get().resolvedClass()).isEqualTo(ProductsPage.class);
  }

  @Test
  void uiRouteDoesNotMatchAnotherPath() {
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/other", ProductsPage.class, command("/other", "_empty")))
        .isEmpty();
  }

  @Test
  void paramSegmentsMatchAnyValue() {
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/orders/42", OrderPage.class, command("/orders/42", "_empty")))
        .isPresent();
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/orders/abc-9", OrderPage.class, command("/orders/abc-9", "_empty")))
        .isPresent();
  }

  @Test
  void paramSegmentsDoNotSwallowExtraSegments() {
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/orders/42/edit", OrderPage.class, command("/orders/42/edit", "_empty")))
        .isEmpty();
  }

  @Test
  void routeWithParentRouteOnlyMatchesUnderThatParent() {
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/detail", HostedDetail.class, command("/detail", "/host")))
        .isPresent();
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/detail", HostedDetail.class, command("/detail", "/elsewhere")))
        .isEmpty();
  }

  @Test
  void multiRoutesMatchEachDeclaredPattern() {
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/a", MultiRouted.class, command("/a", "_empty")))
        .isPresent();
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/b/xyz", MultiRouted.class, command("/b/xyz", "_empty")))
        .isPresent();
    assertThat(
            RouteAnnotationMatcher.matchesAbsolute(
                "/c", MultiRouted.class, command("/c", "_empty")))
        .isEmpty();
  }
}
