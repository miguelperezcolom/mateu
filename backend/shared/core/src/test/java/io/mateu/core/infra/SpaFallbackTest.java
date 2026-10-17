package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class SpaFallbackTest {

  @Test
  void candidates() {
    assertThat(SpaFallback.candidate("/orders/42")).isTrue();
    assertThat(SpaFallback.candidate("/")).isFalse();
    assertThat(SpaFallback.candidate("/assets/mateu.js")).isFalse();
    assertThat(SpaFallback.candidate("/actuator/health")).isFalse();
    assertThat(SpaFallback.candidate(null)).isFalse();
  }

  @Test
  void theLongestBaseUrlOwnsADeepLink() {
    var bases = List.of("", "/admin", "/admin/hotel");
    assertThat(SpaFallback.target("/admin/hotel/stays/1", bases)).isEqualTo("/admin/hotel");
    assertThat(SpaFallback.target("/admin/users", bases)).isEqualTo("/admin");
    assertThat(SpaFallback.target("/orders/1", bases)).isEqualTo("/");
    assertThat(SpaFallback.target("/mateu/v3/whatever", bases)).isNull();
  }

  @Test
  void indexes() {
    assertThat(SpaFallback.isIndex("/admin", List.of("/admin"))).isTrue();
    assertThat(SpaFallback.isIndex("/admin/x", List.of("/admin", ""))).isFalse();
  }

  @Test
  void onlyANavigationGetsTheIndex() {
    // a browser reload / shared link
    assertThat(SpaFallback.acceptsHtml("text/html,application/xhtml+xml,*/*;q=0.8")).isTrue();
    assertThat(SpaFallback.acceptsHtml(null)).isTrue();
    // a data fetch (axios, fetch(), a REST source whose endpoint does not exist yet)
    assertThat(SpaFallback.acceptsHtml("application/json, text/plain, */*")).isFalse();
    assertThat(SpaFallback.acceptsHtml("*/*")).isFalse();
  }
}
