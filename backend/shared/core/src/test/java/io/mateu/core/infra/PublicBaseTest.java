package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class PublicBaseTest {

  @AfterEach
  void clear() {
    System.clearProperty(PublicBase.PREFIX);
    System.clearProperty(PublicBase.TRUST_FORWARDED_PREFIX);
  }

  @Test
  void normalizesAPlainPathAndRefusesEverythingElse() {
    assertThat(PublicBase.normalize(null)).isEmpty();
    assertThat(PublicBase.normalize("")).isEmpty();
    assertThat(PublicBase.normalize("/")).isEmpty();
    assertThat(PublicBase.normalize("/crm/")).isEqualTo("/crm");
    assertThat(PublicBase.normalize("crm")).isEqualTo("/crm");
    assertThat(PublicBase.normalize("/a/b")).isEqualTo("/a/b");
    // a proxy that chains prefixes: the first one is the client-facing one
    assertThat(PublicBase.normalize("/edge, /inner")).isEqualTo("/edge");
    // never markup, never another origin
    assertThat(PublicBase.normalize("/\"><script>")).isEmpty();
    assertThat(PublicBase.normalize("//evil.example")).isEmpty();
    assertThat(PublicBase.normalize("https://evil.example")).isEmpty();
  }

  @Test
  void theContextPathAloneIsTheBase() {
    assertThat(PublicBase.of("/crm", null)).isEqualTo("/crm");
    assertThat(PublicBase.of("", null)).isEmpty();
    assertThat(PublicBase.of(null, null)).isEmpty();
  }

  @Test
  void theForwardedPrefixCountsOnlyWhenTrusted() {
    assertThat(PublicBase.of("", "/crm")).isEmpty();
    System.setProperty(PublicBase.TRUST_FORWARDED_PREFIX, "true");
    assertThat(PublicBase.of("", "/crm")).isEqualTo("/crm");
    // the proxy's prefix goes in front of the framework's own context path
    assertThat(PublicBase.of("/app", "/crm")).isEqualTo("/crm/app");
    assertThat(PublicBase.of("", "/\"><x>")).isEmpty();
  }

  @Test
  void theSettingWinsOverTheHeader() {
    System.setProperty(PublicBase.PREFIX, "/sales");
    System.setProperty(PublicBase.TRUST_FORWARDED_PREFIX, "true");
    assertThat(PublicBase.of("", "/crm")).isEqualTo("/sales");
    assertThat(PublicBase.of("/app", null)).isEqualTo("/sales/app");
  }

  @Test
  void rewritesTheTemplatesRootRelativeUrls() {
    var html =
        "<base href=\"/\"><script src=\"/assets/a.js\"></script>"
            + "<link rel=\"modulepreload\" href='/assets/b.js'>"
            + "<script type=\"text/mateu-deferred\" data-src=\"/js/c.js\"></script>"
            + "<link href=\"https://cdn.example/x.css\"><link href=\"//cdn.example/y.css\">"
            + "<link href=\"_redwood/app.css\"><script>vbInitConfig={BASE_URL: '/_redwood/'}</script>";
    var out = PublicBase.rewrite(html, "/crm");
    assertThat(out)
        .contains("<base href=\"/crm/\">")
        .contains("src=\"/crm/assets/a.js\"")
        .contains("href='/crm/assets/b.js'")
        .contains("data-src=\"/crm/js/c.js\"")
        .contains("href=\"https://cdn.example/x.css\"")
        .contains("href=\"//cdn.example/y.css\"")
        .contains("href=\"_redwood/app.css\"")
        .contains("BASE_URL: '/crm/_redwood/'");
    assertThat(PublicBase.rewrite(html, "")).isEqualTo(html);
  }
}
