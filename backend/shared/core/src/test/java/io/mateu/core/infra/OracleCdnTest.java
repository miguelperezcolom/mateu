package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class OracleCdnTest {

  private static final String PAGE =
      """
      <link rel="preconnect" href="https://static.oracle.com">
      <link rel="stylesheet" href="https://static.oracle.com/cdn/jet/18.1.0-2510.3/default/css/redwood/oj-redwood-min.css">
      <script>window.vbInitConfig = { JET_CDN_PATH: 'https://static.oracle.com/cdn/jet/18.1.0-2510.3' };</script>
      <script type="text/mateu-deferred" data-src="https://static.oracle.com/cdn/vb/2510.1.0/visual-runtime.js"></script>
      <script>require.config({"paths":{"oj-sp":"https://static.oracle.com/cdn/spectra-ui/oj-sp/2604.1.0"}});</script>
      """;

  @AfterEach
  void cleanUp() {
    System.clearProperty(OracleCdn.SETTING);
  }

  @Test
  void leavesThePageAloneByDefault() {
    assertThat(OracleCdn.apply(PAGE, null)).isEqualTo(PAGE);
    assertThat(OracleCdn.apply(PAGE, "  ")).isEqualTo(PAGE);
    assertThat(OracleCdn.apply(PAGE)).isEqualTo(PAGE);
  }

  @Test
  void pointsEveryOracleUrlAtTheMirror() {
    var page = OracleCdn.apply(PAGE, "https://cdn.example.com:8443/oracle/cdn/");
    assertThat(page)
        .doesNotContain("static.oracle.com")
        .contains("href=\"https://cdn.example.com:8443\"")
        .contains("JET_CDN_PATH: 'https://cdn.example.com:8443/oracle/cdn/jet/18.1.0-2510.3'")
        .contains("https://cdn.example.com:8443/oracle/cdn/vb/2510.1.0/visual-runtime.js")
        .contains(
            "\"oj-sp\":\"https://cdn.example.com:8443/oracle/cdn/spectra-ui/oj-sp/2604.1.0\"");
  }

  @Test
  void readsTheSetting() {
    System.setProperty(OracleCdn.SETTING, "https://mirror.example.com/cdn");
    assertThat(OracleCdn.apply(PAGE)).contains("https://mirror.example.com/cdn/jet/");
    // the shared page builder applies it
    assertThat(IndexPage.render(PAGE, IndexPage.Spec.of("", "x")))
        .doesNotContain("static.oracle.com/cdn");
  }

  @Test
  void ignoresAnythingButAPlainAbsoluteHttpUrl() {
    for (var bad :
        new String[] {
          "cdn.example.com/oracle", "javascript:alert(1)", "https://x.com/a\"><script>",
          "ftp://x.com/cdn", "https://x.com/a b", "/relative/cdn"
        }) {
      assertThat(OracleCdn.apply(PAGE, bad)).as(bad).isEqualTo(PAGE);
    }
  }
}
