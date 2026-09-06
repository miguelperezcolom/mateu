package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.uidl.Capabilities;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Capability descriptor: an app advertises, on {@code AppDto.requiredCapabilities}, the tokens it
 * needs from whatever renderer/shell hosts it — so a host can check it PROVIDES them all instead of
 * rendering a broken screen. Compatibility by capability, not by version. Most tokens are DERIVED
 * from the app's own metadata (it needs {@code command-center} because it opted in); a developer
 * can DECLARE extra ones via {@code @App(requires = {...})}.
 */
class CapabilitiesSyncTest {

  @SuppressWarnings("unused")
  @UI("/caps-plain")
  @Title("Plain")
  @App
  public static class PlainApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/caps-rich")
  @Title("Rich")
  @App(
      commandCenter = true,
      requires = {"my-custom-widget"})
  public static class RichApp {
    @Menu String home = "/";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlainApp.class, RichApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private AppDto app(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  @Test
  void aPlainAppDoesNotRequireFeaturesItNeverDeclared() {
    // It may still carry ambient, deployment-wide capabilities (e.g. rest-sources when a catalogue
    // exists) — but never a feature this particular app did not opt into.
    var caps = app("/caps-plain").requiredCapabilities();
    assertThat(caps).doesNotContain(Capabilities.COMMAND_CENTER, "my-custom-widget");
  }

  @Test
  void aDerivedCapabilityIsAdvertised() {
    // command center opted in → the app needs a renderer that provides it.
    assertThat(app("/caps-rich").requiredCapabilities()).contains(Capabilities.COMMAND_CENTER);
  }

  @Test
  void anExplicitlyDeclaredCapabilityIsAdvertised() {
    assertThat(app("/caps-rich").requiredCapabilities()).contains("my-custom-widget");
  }

  @Test
  void theDescriptorIsSortedAndDeduped() {
    var caps = app("/caps-rich").requiredCapabilities();
    assertThat(caps).isSorted();
    assertThat(caps).doesNotHaveDuplicates();
  }

  @Test
  void aDerivedCapabilityTracksTheWireItIsDerivedFrom() {
    // rest-sources is advertised exactly when the app actually carries the source catalogue — the
    // descriptor never contradicts the metadata it is derived from.
    var appDto = app("/caps-rich");
    assertThat(appDto.requiredCapabilities().contains(Capabilities.REST_SOURCES))
        .isEqualTo(!appDto.restSources().isEmpty());
  }
}
