package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.HeaderValueDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import org.junit.jupiter.api.Test;

/**
 * The YAML twin of {@link AppShellExtrasSyncTest}: a {@code type: AppShell} declares app shortcuts
 * ({@code shortcuts:}), live header values ({@code headerValues:} + {@code liveUpdates}) and the
 * idle-session warning. Its own class: it boots its own harness, which re-points the static bean
 * provider.
 */
class AppShellExtrasYamlSyncTest {

  /** The YAML twin: a {@code type: AppShell} declares the same three things. */
  @Test
  void aYamlShellDeclaresShortcutsHeaderValuesAndTheIdleWarning() {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "e2-shell", AppShellExtrasYamlSyncTest.class.getClassLoader()));
    UIIncrementDto increment;
    try (var yaml = TestMateu.withUis()) {
      increment =
          yaml.run(
              RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build());
    } finally {
      thread.setContextClassLoader(previous);
    }
    var app =
        (AppDto) ((ClientSideComponentDto) increment.fragments().get(0).component()).metadata();
    assertThat(app.shortcuts()).hasSize(2);
    assertThat(app.shortcuts().get(0).key()).isEqualTo("f9");
    assertThat(app.shortcuts().get(0).code()).isEqualTo("GST");
    assertThat(app.shortcuts().get(0).route()).endsWith("guests");
    assertThat(app.shortcuts().get(1).label()).isEqualTo("Home");
    assertThat(app.headerValues())
        .containsExactly(new HeaderValueDto("businessDate", "Business date", "12 Oct 2026"));
    assertThat(app.liveUpdates()).isTrue();
    assertThat(app.idleSession().timeoutSeconds()).isEqualTo(15 * 60);
    assertThat(app.idleSession().warningSeconds()).isEqualTo(90);
    assertThat(app.idleSession().signOutUrl()).isEqualTo("/logout");
  }
}
