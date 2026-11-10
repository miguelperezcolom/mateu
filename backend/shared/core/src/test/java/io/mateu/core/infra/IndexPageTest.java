package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class IndexPageTest {

  static final String VITE_PAGE =
      """
      <html><head><!-- AQUIKEYCLOAK --><!-- AQUIFAVICON --><title>AQUIELTITULODELAPAGINA</title>
      <!-- AQUIJS --><script type="module" crossorigin src="/assets/mateu-vaadin.js"></script><!-- HASTAAQUIJS -->
      </head><body><!-- AQUIUI --><mateu-ui></mateu-ui><!-- HASTAAQUIUI --></body></html>
      """;

  static final String VB_PAGE =
      """
      <html><head><!-- AQUIKEYCLOAK --><title>AQUIELTITULODELAPAGINA</title>
      <!-- AQUIJS --><script type="text/mateu-deferred" data-src="https://static.oracle.com/require.js"></script><!-- HASTAAQUIJS -->
      </head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>
      """;

  @Test
  void mountsTheUiAndStampsTheTitle() {
    var html = IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/admin", "Costs in $1"));
    assertThat(html).contains("<title>Costs in $1</title>");
    assertThat(html)
        .contains(
            "<mateu-ui baseUrl=\"/admin\" pathPrefix=\"/admin\""
                + " style=\"width:100%;height:100vh;\"></mateu-ui>");
    assertThat(html).doesNotContain("<!-- AQUIUI -->");
    // the page keeps booting itself with its own module
    assertThat(html)
        .contains("<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\">");
  }

  @Test
  void everyPageCarriesTheDeferredBootReplayerWithAFallback() {
    var html = IndexPage.render(VB_PAGE, IndexPage.Spec.of("", "PMS"));
    assertThat(html).contains(IndexPage.DEFERRED_BOOT);
    assertThat(IndexPage.DEFERRED_BOOT)
        .contains("text/mateu-deferred")
        .contains("data-src")
        .contains("onerror")
        .contains("mateu-boot-failed")
        .contains("The application could not start");
  }

  @Test
  void debugAndExtraHead() {
    var spec =
        new IndexPage.Spec(
            "",
            "T",
            "<link rel=icon>",
            List.of("/x.js"),
            "<meta name=\"a\" content=\"b\">",
            true,
            null);
    var html = IndexPage.render(VITE_PAGE, spec);
    assertThat(html).contains("debug=\"true\"");
    // the app's own head comes before the installable-app head (Pwa), which is added last
    assertThat(html).contains("<meta name=\"a\" content=\"b\"><link rel=\"manifest\"");
    assertThat(html).contains("<link rel=icon>");
    assertThat(html).contains("<script type='module' src='/x.js'></script><title>T</title>");
  }

  @Test
  void aServedPageCarriesNoTemplateMarkerAndMateusFaviconByDefault() {
    for (var page : List.of(VITE_PAGE, VB_PAGE)) {
      var html = IndexPage.render(page, IndexPage.Spec.of("/admin", "T"));
      assertThat(html).doesNotContain("AQUI").doesNotContain("vite.svg");
    }
    assertThat(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T")))
        .contains(IndexPage.DEFAULT_FAVICON)
        .contains("/assets/mateu-icon.svg");
    assertThat(IndexPage.faviconOf("<link rel=icon href=/x.png>"))
        .isEqualTo("<link rel=icon href=/x.png>");
  }

  @Test
  void theShippedVaadinTemplateServesNoMarkerAndNoViteIcon() throws Exception {
    // the renderer's own template, as the vaadin-lit jar ships it (read from the source tree)
    var file =
        java.nio.file.Path.of("../frontend/vaadin-lit/src/main/resources/static/_index.html");
    org.junit.jupiter.api.Assumptions.assumeTrue(java.nio.file.Files.exists(file));
    var html =
        IndexPage.render(java.nio.file.Files.readString(file), IndexPage.Spec.of("", "Products"));
    assertThat(html).doesNotContain("AQUI").doesNotContain("vite.svg");
  }

  @Test
  void aViteBuiltPageHasNoInlineScriptSoItRunsUnderScriptSrcSelf() throws Exception {
    var html = IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T"));
    assertThat(html).doesNotContain(IndexPage.DEFERRED_BOOT);
    assertThat(IndexPage.inlineScriptHashes(html)).isEmpty();
    // the shipped template: its theme script is a file now, not inline
    var file =
        java.nio.file.Path.of("../frontend/vaadin-lit/src/main/resources/static/_index.html");
    if (java.nio.file.Files.exists(file)) {
      var shipped =
          IndexPage.render(java.nio.file.Files.readString(file), IndexPage.Spec.of("", "T"));
      assertThat(IndexPage.inlineScriptHashes(shipped)).isEmpty();
      assertThat(shipped).contains("<script src=\"/assets/mateu-theme.js\"></script>");
    }
  }

  @Test
  void theInlineScriptsOfAVisualBuilderPageAreGivenAsCspHashes() throws Exception {
    var vb = IndexPage.render(VB_PAGE, IndexPage.Spec.of("", "PMS"));
    var expected =
        "'sha256-"
            + java.util.Base64.getEncoder()
                .encodeToString(
                    java.security.MessageDigest.getInstance("SHA-256")
                        .digest(
                            IndexPage.DEFERRED_BOOT
                                .substring(
                                    "<script>".length(),
                                    IndexPage.DEFERRED_BOOT.length() - "</script>".length())
                                .getBytes(java.nio.charset.StandardCharsets.UTF_8)))
            + "'";
    assertThat(IndexPage.inlineScriptHashes(vb)).containsExactly(expected);
    // a script with a src is no inline script; a deferred one with data-src becomes one with a src
    assertThat(
            IndexPage.inlineScriptHashes(
                "<script src=\"/a.js\"></script><script type=\"text/mateu-deferred\" data-src=\"/b.js\"></script>"))
        .isEmpty();
  }

  @Test
  void aPageWithoutMarkersIsLeftAlone() {
    assertThat(IndexPage.mountUi("<html></html>", "<x/>")).isEqualTo("<html></html>");
  }
}
