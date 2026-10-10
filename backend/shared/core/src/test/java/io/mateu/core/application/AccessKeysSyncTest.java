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

/** Keyboard access keys: {@code @App(accessKeys = true)} turns the mode on; it is opt-in. */
class AccessKeysSyncTest {

  @SuppressWarnings("unused")
  @UI("/ak-plain")
  @Title("Plain")
  @App
  public static class PlainApp {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/ak-on")
  @Title("Access keys")
  @App(accessKeys = true)
  public static class AccessKeysApp {
    @Menu String home = "/";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlainApp.class, AccessKeysApp.class);
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
  void accessKeysAreOptIn() {
    assertThat(app("/ak-plain").accessKeys()).isFalse();
    assertThat(app("/ak-on").accessKeys()).isTrue();
  }
}
