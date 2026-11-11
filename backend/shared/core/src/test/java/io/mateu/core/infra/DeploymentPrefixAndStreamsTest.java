package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.security.JsonBodyGuard;
import org.junit.jupiter.api.Test;

/**
 * The deployment rules of the known-issues work: the page under a public prefix ({@link
 * ForwardedPrefix}, {@link IndexPage#underPrefix}), the SSE headers ({@link SseHeaders}), the extra
 * CORS paths ({@link CorsPolicy#covers}) and the media type a strict parser accepts ({@link
 * JsonBodyGuard#normalized}).
 */
class DeploymentPrefixAndStreamsTest {

  @Test
  void theForwardedPrefixIsHonouredOnlyWhenTrusted() {
    assertThat(ForwardedPrefix.of("/ctx", "/proxy", false)).isEqualTo("/ctx");
    assertThat(ForwardedPrefix.of("/ctx", "/proxy", true)).isEqualTo("/proxy");
    assertThat(ForwardedPrefix.of(null, "/proxy/", true)).isEqualTo("/proxy");
    assertThat(ForwardedPrefix.of(null, null, true)).isEmpty();
    assertThat(ForwardedPrefix.of("", "", true)).isEmpty();
    // several proxies: the first (outermost) one
    assertThat(ForwardedPrefix.of(null, "/a, /b", true)).isEqualTo("/a");
  }

  @Test
  void aPrefixThatIsNotAPlainPathIsIgnored() {
    assertThat(ForwardedPrefix.normalize("app")).isEqualTo("/app");
    assertThat(ForwardedPrefix.normalize("//evil.example")).isEmpty();
    assertThat(ForwardedPrefix.normalize("/a\"><script>")).isEmpty();
    assertThat(ForwardedPrefix.normalize("/a/../b")).isEmpty();
    assertThat(ForwardedPrefix.normalize("/a/b/")).isEqualTo("/a/b");
  }

  static final String VAADIN_PAGE =
      """
      <html><head><link rel="icon" href="/assets/mateu-icon.svg" /><script src="/assets/mateu-theme.js"></script>
      <script type="module" crossorigin src="/assets/mateu-vaadin.js"></script>
      <link rel="stylesheet" href='/assets/index.css'><script src="https://cdn.example/x.js"></script>
      <script src="//cdn.example/y.js"></script><meta name="mateu-dev" content="/mateu/dev/events">
      </head><body><mateu-ui baseUrl="/admin" pathPrefix="/admin" style="width:100%"></mateu-ui></body></html>
      """;

  @Test
  void thePageNamesItsAssetsAndApiUnderThePrefix() {
    var html = IndexPage.underPrefix(VAADIN_PAGE, "/ctx");
    assertThat(html)
        .contains("href=\"/ctx/assets/mateu-icon.svg\"")
        .contains("src=\"/ctx/assets/mateu-theme.js\"")
        .contains("src=\"/ctx/assets/mateu-vaadin.js\"")
        .contains("href='/ctx/assets/index.css'")
        .contains("src=\"https://cdn.example/x.js\"")
        .contains("src=\"//cdn.example/y.js\"")
        .contains("content=\"/ctx/mateu/dev/events\"")
        .contains("<mateu-ui baseUrl=\"/ctx/admin\" contextPath=\"/ctx\" pathPrefix=\"/admin\"");
  }

  @Test
  void theRootMountAndRedwoodPagesToo() {
    var root =
        IndexPage.underPrefix(
            "<html><head><base href=\"/\"><script>window.vbInitConfig = { BASE_URL:"
                + " '/_redwood/', };</script></head><body><mateu-ui baseUrl=\"\""
                + " pathPrefix=\"\"></mateu-ui></body></html>",
            "/a/b");
    assertThat(root)
        .contains("<base href=\"/a/b/\">")
        .contains("BASE_URL: '/a/b/_redwood/'")
        .contains("<mateu-ui baseUrl=\"/a/b\" contextPath=\"/a/b\" pathPrefix=\"\"");
  }

  @Test
  void noPrefixLeavesThePageAsItIs() {
    assertThat(IndexPage.underPrefix(VAADIN_PAGE, "")).isEqualTo(VAADIN_PAGE);
    assertThat(IndexPage.underPrefix(VAADIN_PAGE, null)).isEqualTo(VAADIN_PAGE);
    assertThat(IndexPage.underPrefix(VAADIN_PAGE, "//evil")).isEqualTo(VAADIN_PAGE);
  }

  @Test
  void streamsAreTheSseEndpointsAndTheDevEvents() {
    assertThat(SseHeaders.isStream("/hello/mateu/v3/sse/_no_route")).isTrue();
    assertThat(SseHeaders.isStream("/mateu/v3/sse/x")).isTrue();
    assertThat(SseHeaders.isStream("/mateu/dev/events")).isTrue();
    assertThat(SseHeaders.isStream("/hello/mateu/v3/sync/_no_route")).isFalse();
    assertThat(SseHeaders.isStream(null)).isFalse();
    assertThat(SseHeaders.HEADERS)
        .containsEntry("X-Accel-Buffering", "no")
        .containsEntry("Cache-Control", "no-cache, no-transform");
  }

  @Test
  void corsCoversTheConfiguredPathsBesidesMateusApi() {
    var policy = CorsPolicy.of("https://shell.example", null, "/elements/**, assets/remote*.js");
    assertThat(policy.extraPaths()).containsExactly("/elements/**", "/assets/remote*.js");
    assertThat(policy.covers("/hello/mateu/v3/sync/x")).isTrue();
    assertThat(policy.covers("/elements")).isTrue();
    assertThat(policy.covers("/elements/x.js")).isTrue();
    assertThat(policy.covers("/elements/a/b/c.js")).isTrue();
    assertThat(policy.covers("/assets/remote-widget.js")).isTrue();
    assertThat(policy.covers("/assets/remote/x.js")).isFalse();
    assertThat(policy.covers("/elementsx/x.js")).isFalse();
    assertThat(policy.covers("/assets/mateu-vaadin.js")).isFalse();
    // decided on the canonical path: a dot segment does not escape the pattern
    assertThat(policy.covers("/elements/../admin")).isFalse();
    assertThat(CorsPolicy.of("https://shell.example", null).covers("/elements/x.js")).isFalse();
  }

  @Test
  void blanksAroundTheParametersOfAMediaTypeAreDropped() {
    assertThat(JsonBodyGuard.normalized("application/json ;charset=UTF-8"))
        .isEqualTo("application/json;charset=UTF-8");
    assertThat(JsonBodyGuard.normalized(" application/json ; charset = UTF-8 ;"))
        .isEqualTo("application/json;charset=UTF-8");
    assertThat(JsonBodyGuard.normalized("application/json")).isEqualTo("application/json");
    assertThat(JsonBodyGuard.normalized(null)).isNull();
  }
}
