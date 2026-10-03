package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** The {@code @UI}/{@code @App(route)} pattern matcher: params, literal segments and the root. */
class RouteAnnotationMatcherReviewTest {

  @Test
  void aParamSegmentMatchesAnyOneSegment() {
    assertThat(RouteAnnotationMatcher.matches("/orders/42", "/orders/:id")).isTrue();
    assertThat(RouteAnnotationMatcher.matches("/orders/42/x", "/orders/:id")).isFalse();
  }

  @Test
  void literalSegmentsAreLiteral() {
    assertThat(RouteAnnotationMatcher.matches("/v1.0", "/v1.0")).isTrue();
    // a "." used to be a regex wildcard
    assertThat(RouteAnnotationMatcher.matches("/v1x0", "/v1.0")).isFalse();
    assertThat(RouteAnnotationMatcher.matches("/a+b", "/a+b")).isTrue();
  }

  @Test
  void theRootPatternDoesNotThrow() {
    // "/" used to end in deleteCharAt(-1) → StringIndexOutOfBoundsException on every request
    assertThat(RouteAnnotationMatcher.matches("", "/")).isTrue();
    assertThat(RouteAnnotationMatcher.matches("/x", "/")).isFalse();
    assertThat(RouteAnnotationMatcher.matches("", "")).isTrue();
  }
}
