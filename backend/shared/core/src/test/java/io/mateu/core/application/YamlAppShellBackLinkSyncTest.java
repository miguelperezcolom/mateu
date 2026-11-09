package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

/**
 * A {@code type: AppShell} declaring {@code backLink: PARENT} and {@code pageTitle:} — the data
 * twin of {@code @App(backLink = PARENT)} on a record master: one "← Parent" link (to the nearest
 * route above the shell's that resolves to a screen) instead of the breadcrumb trail.
 *
 * <p>Also the Java golden the .NET and Python ports are held to ({@code YamlAppShellTests}, {@code
 * test_yaml_app_shell.py}): run with {@code -Dmateu.golden.write=true} to refresh {@code
 * app-shell-back-link.golden.json}.
 */
class YamlAppShellBackLinkSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  private static UIIncrementDto loadShell() {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "shell-back-link", YamlAppShellBackLinkSyncTest.class.getClassLoader()));
    try (var mateu = TestMateu.withUis()) {
      return mateu.run(
          RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build());
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  @Test
  void aShellsBackLinkReplacesTheTrailWithALinkToItsParent() throws Exception {
    var increment = loadShell();
    var component = (ClientSideComponentDto) increment.fragments().get(0).component();
    var app = (AppDto) component.metadata();
    // the link replaces the trail; a shell at its mount's root has no route above it, so there is
    // no "← Parent" to draw (the renderer then draws nothing rather than a dead link)
    assertThat(app.noBreadcrumbs()).isTrue();
    assertThat(app.backRoute()).isNull();
    assertThat(app.backLabel()).isNull();
    // pageTitle is the browser tab's / the installed app's name, not part of the shell's wire
    assertThat(app.title()).isEqualTo("Record");
    maybeWriteGolden(increment);
  }

  private static void maybeWriteGolden(UIIncrementDto increment) throws Exception {
    if (!Boolean.getBoolean("mateu.golden.write")) return;
    JsonNode tree = JSON.valueToTree(increment);
    var target =
        Path.of(
            "../../../frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__/app-shell-back-link.golden.json");
    Files.writeString(target, JSON.writerWithDefaultPrettyPrinter().writeValueAsString(tree));
  }
}
