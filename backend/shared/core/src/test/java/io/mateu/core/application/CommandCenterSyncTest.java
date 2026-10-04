package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The command center (the Ask-Oracle pattern): {@code @App(commandCenter=true)} advertises the
 * always-present FAB + full-screen palette ({@code AppDto.commandCenterEnabled});
 * {@code @App(chromeless=true)} additionally drops the nav chrome ({@code AppDto.chromeless}) and
 * implies the command center so navigation stays possible. A plain {@code @App} opts into neither.
 */
class CommandCenterSyncTest {

  @SuppressWarnings("unused")
  @UI("/cc-plain")
  @Title("Plain")
  @App
  public static class PlainApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/cc-on")
  @Title("Command center")
  @App(commandCenter = true)
  public static class CommandCenterApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/cc-chromeless")
  @Title("Chromeless")
  @App(chromeless = true)
  public static class ChromelessApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/cc-branded")
  @Title("Branded")
  @App(
      askLabel = "Ask RIU",
      askIcon = " R ",
      accentColor = " #D2232A ",
      accentStrip = " /images/strip.svg ")
  public static class BrandedAskApp {
    @Menu String home = "/";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            PlainApp.class, CommandCenterApp.class, ChromelessApp.class, BrandedAskApp.class);
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
  void aPlainAppEnablesNeither() {
    var app = app("/cc-plain");
    assertThat(app.commandCenterEnabled()).isFalse();
    assertThat(app.chromeless()).isFalse();
  }

  @Test
  void commandCenterTrueEnablesTheFabWithoutChromeless() {
    var app = app("/cc-on");
    assertThat(app.commandCenterEnabled()).isTrue();
    assertThat(app.chromeless()).isFalse();
  }

  @Test
  void chromelessImpliesTheCommandCenter() {
    var app = app("/cc-chromeless");
    assertThat(app.chromeless()).isTrue();
    assertThat(app.commandCenterEnabled()).isTrue();
  }

  @Test
  void theAskFabKeepsTheRenderersBrandUnlessTheAppNamesItsOwn() {
    var plain = app("/cc-plain");
    assertThat(plain.askLabel()).isNull();
    assertThat(plain.askIcon()).isNull();
    var branded = app("/cc-branded");
    assertThat(branded.askLabel()).isEqualTo("Ask RIU");
    assertThat(branded.askIcon()).isEqualTo("R");
  }

  @Test
  void theAccentIsOnlyThereWhenTheAppDeclaresIt() {
    assertThat(app("/cc-plain").accentColor()).isNull();
    assertThat(app("/cc-branded").accentColor()).isEqualTo("#D2232A");
  }

  @Test
  void theAccentStripIsOnlyThereWhenTheAppDeclaresIt() {
    assertThat(app("/cc-plain").accentStrip()).isNull();
    assertThat(app("/cc-branded").accentStrip()).isEqualTo("/images/strip.svg");
  }
}
