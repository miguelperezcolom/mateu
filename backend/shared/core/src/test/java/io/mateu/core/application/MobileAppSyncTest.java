package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.MobileManifest;
import io.mateu.core.infra.SpaFallback;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.MobileApp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppShell;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Mateu mobile app (design/mobile-app-hub.md, phase 1): {@code @App(mobileQr)} puts "Open on
 * mobile" on the header, and {@link MobileManifest} answers {@code <baseUrl>/mateu/v3/manifest}.
 * The JSON strings are the cross-port fixtures — .NET's {@code MobileManifestTests} and Python's
 * {@code test_mobile_manifest.py} assert exactly the same ones.
 */
class MobileAppSyncTest {

  @SuppressWarnings("unused")
  @UI("/mob-plain")
  @Title("Plain")
  @App
  public static class PlainApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/mob-acme")
  @Title("Acme CRM")
  @Logo("/images/acme.svg")
  @App(mobileQr = true)
  @MobileApp(
      shortName = "CRM",
      themeColor = "#1f6feb",
      oidcIssuer = "https://auth.acme.com/realms/acme",
      oidcClientId = "mateu-mobile")
  public static class AcmeApp {
    @Menu String home = "/";
  }

  /** No @Title: the name is the class name, humanized; the accent colour is the theme colour. */
  @App(accentColor = "#D2232A")
  public static class BackOfficeHome {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlainApp.class, AcmeApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @AfterEach
  void clearSettings() {
    for (var key :
        List.of(
            MobileManifest.NAME,
            MobileManifest.SHORT_NAME,
            MobileManifest.ICON,
            MobileManifest.THEME_COLOR,
            MobileManifest.MIN_APP_VERSION,
            MobileManifest.OIDC_ISSUER,
            MobileManifest.OIDC_CLIENT_ID,
            MobileManifest.OIDC_SCOPES)) {
      System.clearProperty(key);
    }
  }

  private AppDto app(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  @Test
  void openOnMobileIsOptIn() {
    assertThat(app("/mob-plain").mobileQr()).isFalse();
    assertThat(app("/mob-acme").mobileQr()).isTrue();
  }

  @Test
  void theAcmeManifest() {
    assertThat(MobileManifest.json(AcmeApp.class.getName()))
        .isEqualTo(
            "{\"name\":\"Acme CRM\",\"shortName\":\"CRM\",\"icon\":\"/images/acme.svg\","
                + "\"themeColor\":\"#1f6feb\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\","
                + "\"auth\":{\"type\":\"oidc\",\"issuer\":\"https://auth.acme.com/realms/acme\","
                + "\"clientId\":\"mateu-mobile\",\"scopes\":[\"openid\",\"profile\"]}}");
  }

  @Test
  void thePlainManifestOmitsWhatIsNotDeclared() {
    assertThat(MobileManifest.json(PlainApp.class.getName()))
        .isEqualTo(
            "{\"name\":\"Plain\",\"shortName\":\"Plain\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\"}");
  }

  @Test
  void settingsWinOverTheAnnotation() {
    System.setProperty(MobileManifest.OIDC_ISSUER, "https://idp.example");
    System.setProperty(MobileManifest.OIDC_CLIENT_ID, "app");
    System.setProperty(MobileManifest.OIDC_SCOPES, "openid email");
    assertThat(MobileManifest.json(PlainApp.class.getName()))
        .isEqualTo(
            "{\"name\":\"Plain\",\"shortName\":\"Plain\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\","
                + "\"auth\":{\"type\":\"oidc\",\"issuer\":\"https://idp.example\",\"clientId\":\"app\","
                + "\"scopes\":[\"openid\",\"email\"]}}");
    System.setProperty(MobileManifest.NAME, "Acme Sales");
    System.setProperty(MobileManifest.MIN_APP_VERSION, "1.2.0");
    assertThat(MobileManifest.json(AcmeApp.class.getName()))
        .startsWith(
            "{\"name\":\"Acme Sales\",\"shortName\":\"CRM\",\"icon\":\"/images/acme.svg\","
                + "\"themeColor\":\"#1f6feb\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.2.0\","
                + "\"auth\":{\"type\":\"oidc\",\"issuer\":\"https://idp.example\"");
  }

  @Test
  void authNeedsBothIssuerAndClientId() {
    System.setProperty(MobileManifest.OIDC_ISSUER, "https://idp.example");
    assertThat(MobileManifest.json(PlainApp.class.getName())).doesNotContain("auth");
  }

  @Test
  void theNameFallsBackToTheClassAndTheColourToTheAccent() {
    assertThat(MobileManifest.json(BackOfficeHome.class.getName()))
        .isEqualTo(
            "{\"name\":\"Back office home\",\"shortName\":\"Back office home\","
                + "\"themeColor\":\"#D2232A\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\"}");
    assertThat(MobileManifest.json("no.such.Ui")).contains("\"name\":\"Mateu\"");
  }

  @Test
  void aDataAuthoredShellGivesItsTitleLogoAndAccent() {
    var shell =
        AppShell.builder()
            .title("Orders")
            .logo("https://cdn.example/orders.png")
            .accentColor("#123456")
            .build();
    assertThat(MobileManifest.json(shell))
        .isEqualTo(
            "{\"name\":\"Orders\",\"shortName\":\"Orders\",\"icon\":\"https://cdn.example/orders.png\","
                + "\"themeColor\":\"#123456\",\"wireVersion\":\"3.0\",\"minAppVersion\":\"1.0.0\"}");
    assertThat(MobileManifest.json((AppShell) null)).contains("\"name\":\"Mateu\"");
  }

  @Test
  void theEndpointPathIsNeverADeepLink() {
    assertThat(MobileManifest.isEndpoint("/crm/mateu/v3/manifest")).isTrue();
    assertThat(MobileManifest.baseUrlOf("/crm/mateu/v3/manifest")).isEqualTo("/crm");
    assertThat(MobileManifest.baseUrlOf("/mateu/v3/manifest")).isEmpty();
    assertThat(SpaFallback.candidate("/crm/mateu/v3/manifest")).isFalse();
  }
}
