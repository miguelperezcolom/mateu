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
  void underAPublicBaseThePageIsWrittenForThePublicPath() {
    var html =
        IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/admin", "T").withPublicBase("/crm/"));
    assertThat(html)
        .contains("<mateu-ui baseUrl=\"/crm/admin\" pathPrefix=\"/crm/admin\" publicBase=\"/crm\"")
        .contains("src=\"/crm/assets/mateu-vaadin.js\"")
        .doesNotContain("=\"/assets/");
    // a root UI under the base
    assertThat(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T").withPublicBase("/crm")))
        .contains("<mateu-ui baseUrl=\"/crm\" pathPrefix=\"/crm\" publicBase=\"/crm\"");
    // no base: exactly as before
    assertThat(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/admin", "T").withPublicBase("")))
        .isEqualTo(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/admin", "T")));
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

  // The renderer keeps its route-structure cache per app: two apps served one after the other on
  // the same origin must be told apart before the first request (the 403 on every page the previous
  // app had visited, because its cached screens named its own view types).
  @Test
  void thePageSaysWhichAppItIsWithAnOpaqueFingerprint() {
    var orders = IndexPage.Spec.of("", "Orders").withUiId("com.acme.orders.OrdersUi");
    var html = IndexPage.render(VITE_PAGE, orders);
    var fingerprint = IndexPage.appFingerprint("com.acme.orders.OrdersUi|");
    assertThat(html)
        .contains("<meta name=\"mateu-app\" content=\"" + fingerprint + "\">")
        // opaque: the page does not spell out the class
        .doesNotContain("com.acme.orders");
    assertThat(fingerprint).matches("[0-9a-f]{16}");
    // stable for the same app and mount, so a reload keeps the cache
    assertThat(IndexPage.render(VITE_PAGE, orders)).isEqualTo(html);
  }

  @Test
  void anotherAppOrAnotherMountHasAnotherFingerprint() {
    var a = IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T").withUiId("com.acme.A"));
    var b = IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T").withUiId("com.acme.B"));
    var nested =
        IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/admin", "T").withUiId("com.acme.A"));
    assertThat(metaOf(a)).isNotEqualTo(metaOf(b)).isNotEqualTo(metaOf(nested));
    // a page whose controller names no UI class still has one (from its mount)
    assertThat(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/x", "T")))
        .contains("name=\"mateu-app\"");
  }

  @Test
  void theAppTagIsAddedOnceAndOnlyToAPageWithAHead() {
    var once = IndexPage.appHead("<html><head></head></html>", "a");
    assertThat(IndexPage.appHead(once, "b")).isEqualTo(once);
    assertThat(IndexPage.appHead("<div></div>", "a")).isEqualTo("<div></div>");
    assertThat(IndexPage.appHead(null, "a")).isNull();
  }

  private static String metaOf(String html) {
    var at = html.indexOf("name=\"mateu-app\" content=\"");
    return html.substring(at, at + 50);
  }
}
