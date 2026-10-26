package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.dev.DevMode;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.MobileApp;
import io.mateu.uidl.annotations.Title;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Every UI as an installable Progressive Web App ({@link Pwa}). The manifest JSON strings are the
 * cross-port fixtures: .NET's {@code PwaTests} and Python's {@code test_pwa.py} assert exactly the
 * same ones, and the worker, registration script and icons are byte-identical copies there.
 */
class PwaTest {

  @Title("Acme CRM")
  @Logo("/images/acme.svg")
  @App(accentColor = "#d2232a")
  @MobileApp(shortName = "CRM", themeColor = "#1f6feb")
  static class AcmeApp {}

  @Title("Plain")
  static class PlainApp {}

  @AfterEach
  void clear() {
    System.clearProperty(Pwa.ENABLED);
    System.clearProperty(MobileManifest.ICON);
    System.clearProperty(MobileManifest.THEME_COLOR);
    System.clearProperty(DevMode.PROPERTY);
  }

  static final String PLAIN_MANIFEST =
      "{\"id\":\"/\",\"name\":\"Plain\",\"short_name\":\"Plain\",\"start_url\":\"/\",\"scope\":\"/\","
          + "\"display\":\"standalone\",\"background_color\":\"#ffffff\",\"icons\":["
          + "{\"src\":\"icon-192.png\",\"sizes\":\"192x192\",\"type\":\"image/png\",\"purpose\":\"any\"},"
          + "{\"src\":\"icon-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"any\"},"
          + "{\"src\":\"icon-maskable-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"maskable\"}]}";

  static final String ACME_MANIFEST =
      "{\"id\":\"/crm\",\"name\":\"Acme CRM\",\"short_name\":\"CRM\",\"start_url\":\"/crm\","
          + "\"scope\":\"/crm\",\"display\":\"standalone\",\"background_color\":\"#ffffff\","
          + "\"theme_color\":\"#1f6feb\",\"icons\":["
          + "{\"src\":\"/images/acme.svg\",\"sizes\":\"any\",\"type\":\"image/svg+xml\",\"purpose\":\"any\"},"
          + "{\"src\":\"icon-192.png\",\"sizes\":\"192x192\",\"type\":\"image/png\",\"purpose\":\"any\"},"
          + "{\"src\":\"icon-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"any\"},"
          + "{\"src\":\"icon-maskable-512.png\",\"sizes\":\"512x512\",\"type\":\"image/png\",\"purpose\":\"maskable\"}]}";

  @Test
  void theManifestIsDerivedLikeTheMobileOne() {
    assertThat(Pwa.manifestJson(MobileManifest.sourceOf(PlainApp.class.getName()), "/", "/"))
        .isEqualTo(PLAIN_MANIFEST);
    assertThat(Pwa.manifestJson(MobileManifest.sourceOf(AcmeApp.class.getName()), "/crm", "/crm"))
        .isEqualTo(ACME_MANIFEST);
  }

  @Test
  void aSettingWinsAsForTheMobileManifest() {
    System.setProperty(MobileManifest.THEME_COLOR, "#000000");
    System.setProperty(MobileManifest.ICON, "https://cdn.acme.com/icon-512.png");
    var json = Pwa.manifestJson(MobileManifest.sourceOf(AcmeApp.class.getName()), "/", "/");
    assertThat(json)
        .contains("\"theme_color\":\"#000000\"")
        .contains(
            "{\"src\":\"https://cdn.acme.com/icon-512.png\",\"sizes\":\"any\",\"type\":\"image/png\",\"purpose\":\"any\"}");
  }

  @Test
  void onlyHexThemeColoursAndSafeIconsAreKept() {
    var source =
        new MobileManifest.Source("X", "http://insecure.example/logo.png", null, "red", null);
    var json = Pwa.manifestJson(source, "/", "/");
    assertThat(json).doesNotContain("theme_color").doesNotContain("insecure");
    assertThat(Pwa.declaredIcon(new MobileManifest.Source("X", "logo.png", null, null, null)))
        .isEqualTo("/logo.png");
    assertThat(Pwa.declaredIcon(new MobileManifest.Source("X", "/favicon.ico", null, null, null)))
        .isNull();
    assertThat(
            Pwa.declaredIcon(
                new MobileManifest.Source("X", "javascript:alert(1)", null, null, null)))
        .isNull();
    assertThat(
            Pwa.declaredIcon(
                new MobileManifest.Source("X", "data:text/html,<b>", null, null, null)))
        .isNull();
    assertThat(
            Pwa.declaredIcon(
                new MobileManifest.Source("X", "data:image/png;base64,AAAA", null, null, null)))
        .isEqualTo("data:image/png;base64,AAAA");
    // the favicon is never the app icon: a 16-32 px image would be blurred
    assertThat(Pwa.declaredIcon(new MobileManifest.Source("X", null, "/fav.png", null, null)))
        .isNull();
  }

  @Test
  void scopesAndFolders() {
    assertThat(Pwa.scopeOf("")).isEqualTo("/");
    assertThat(Pwa.scopeOf(null)).isEqualTo("/");
    assertThat(Pwa.scopeOf("/crm/")).isEqualTo("/crm");
    assertThat(Pwa.scopeOf("back-office")).isEqualTo("/back-office");
    assertThat(Pwa.dirOf("")).isEqualTo("/mateu/v3/pwa/");
    assertThat(Pwa.dirOf("/crm")).isEqualTo("/crm/mateu/v3/pwa/");
  }

  static final String VAADIN_PAGE =
      "<html><head><title>T</title><script src=\"/assets/mateu-theme.js\"></script>"
          + "<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\"></script>"
          + "<link rel=\"stylesheet\" href=\"/assets/index.css\"><link rel=\"icon\" href=\"/api/me.png\">"
          + "</head><body></body></html>";

  @Test
  void thePageGetsTheManifestTheColourAndTheWorker() {
    var html = Pwa.served(VAADIN_PAGE, "/crm", MobileManifest.sourceOf(AcmeApp.class.getName()));
    assertThat(html)
        .contains(
            "<link rel=\"manifest\" href=\"/crm/mateu/v3/pwa/manifest.webmanifest\""
                + " crossorigin=\"use-credentials\">")
        .contains("<meta name=\"theme-color\" content=\"#1f6feb\">")
        // an SVG logo is no iOS home-screen icon: Mateu's PNG instead
        .contains("<link rel=\"apple-touch-icon\" href=\"/crm/mateu/v3/pwa/icon-192.png\">")
        .contains(
            "<script src=\"/crm/mateu/v3/pwa/register.js\" data-sw=\"/crm/mateu/v3/pwa/sw.js?v=")
        .contains("&amp;s=%2Fassets%2F\" data-scope=\"/crm\" defer></script></head>");
    // an icon link is not a folder of the page's own files
    assertThat(html).doesNotContain("%2Fapi%2F");
  }

  @Test
  void theWorkerVersionFollowsThePage() {
    var a = Pwa.served(VAADIN_PAGE, "", null);
    var b = Pwa.served(VAADIN_PAGE.replace("mateu-vaadin.js", "mateu-vaadin2.js"), "", null);
    assertThat(versionOf(a)).hasSize(16).isNotEqualTo(versionOf(b));
    assertThat(versionOf(a)).isEqualTo(versionOf(Pwa.served(VAADIN_PAGE, "", null)));
  }

  private static String versionOf(String html) {
    var at = html.indexOf("sw.js?v=") + "sw.js?v=".length();
    return html.substring(at, at + 16);
  }

  @Test
  void staticFoldersAreWhereScriptsAndStylesheetsComeFrom() {
    var redwood =
        "<head><base href=\"/\"><link rel=\"preconnect\" href=\"https://static.oracle.com\">"
            + "<link rel=\"stylesheet\" type=\"text/css\" href=\"https://static.oracle.com/cdn/jet/18/x.css\">"
            + "<link rel=\"stylesheet\" href=\"_redwood/resources/css/app.css?v=1\">"
            + "<script type=\"text/mateu-deferred\" data-src=\"https://static.oracle.com/cdn/jet/require.js\"></script>"
            + "<script src=\"/mateu/v3/x.js\"></script><script src=\"/root.js\"></script>"
            + "<script src=\"data:text/javascript,1\"></script></head>";
    assertThat(Pwa.staticFolders(redwood))
        .containsExactly("https://static.oracle.com/cdn/", "/_redwood/");
  }

  @Test
  void switchedOffThePageIsUntouchedAndTheWorkerUnregisters() {
    System.setProperty(Pwa.ENABLED, "false");
    assertThat(Pwa.served(VAADIN_PAGE, "", null)).isEqualTo(VAADIN_PAGE);
    assertThat(Pwa.asset(Pwa.MANIFEST, PlainApp.class.getName(), "")).isNull();
    assertThat(Pwa.asset(Pwa.REGISTER, PlainApp.class.getName(), "")).isNull();
    var worker = Pwa.asset(Pwa.WORKER, PlainApp.class.getName(), "");
    assertThat(new String(worker.body(), StandardCharsets.UTF_8)).contains("unregister()");
  }

  @Test
  void offInDevelopmentMode() {
    System.setProperty(DevMode.PROPERTY, "true");
    assertThat(Pwa.enabled()).isFalse();
    assertThat(Pwa.served(VAADIN_PAGE, "", null)).isEqualTo(VAADIN_PAGE);
  }

  @Test
  void theFiles() {
    var manifest = Pwa.asset(Pwa.MANIFEST, AcmeApp.class.getName(), "/crm");
    assertThat(manifest.contentType()).isEqualTo("application/manifest+json");
    assertThat(new String(manifest.body(), StandardCharsets.UTF_8)).isEqualTo(ACME_MANIFEST);

    var worker = Pwa.asset(Pwa.WORKER, AcmeApp.class.getName(), "/crm");
    assertThat(worker.headers())
        .containsEntry("Service-Worker-Allowed", "/crm")
        .containsEntry("Cache-Control", "no-cache")
        .containsEntry("Content-Type", "text/javascript; charset=utf-8");
    assertThat(new String(worker.body(), StandardCharsets.UTF_8)).contains("networkFirst");

    assertThat(Pwa.asset(Pwa.REGISTER, AcmeApp.class.getName(), "/crm").body())
        .isEqualTo(Pwa.resource(Pwa.REGISTER));
    for (var icon : List.of(Pwa.ICON_192, Pwa.ICON_512, Pwa.ICON_MASKABLE)) {
      var asset = Pwa.asset(icon, AcmeApp.class.getName(), "/crm");
      assertThat(asset.contentType()).isEqualTo("image/png");
      // a PNG signature
      assertThat(asset.body()).startsWith((byte) 0x89, (byte) 'P', (byte) 'N', (byte) 'G');
    }
    assertThat(Pwa.asset("../secret", AcmeApp.class.getName(), "/crm")).isNull();
    assertThat(Pwa.asset("sw-off.js", AcmeApp.class.getName(), "/crm")).isNull();
  }

  @Test
  void theIndexPageOfAClassUiCarriesIt() {
    var html =
        IndexPage.render(
            "<html><head><title>AQUIELTITULODELAPAGINA</title>"
                + "<script type=\"module\" crossorigin src=\"/assets/mateu-vaadin.js\"></script>"
                + "</head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>",
            IndexPage.Spec.of("/crm", "CRM").withUiId(AcmeApp.class.getName()));
    assertThat(html)
        .contains("/crm/mateu/v3/pwa/manifest.webmanifest")
        .contains("<meta name=\"theme-color\" content=\"#1f6feb\">");
  }

  @Test
  void spaFallbackNeverAnswersThePwaFiles() {
    assertThat(SpaFallback.candidate("/crm/mateu/v3/pwa/sw.js")).isFalse();
    assertThat(Pwa.isEndpoint("/crm/mateu/v3/pwa/sw.js")).isTrue();
  }
}
