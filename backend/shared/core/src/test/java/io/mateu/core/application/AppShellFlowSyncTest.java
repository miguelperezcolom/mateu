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
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.Step;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A {@code type: AppShell} declares FLOWS ({@code actions:} with {@code steps:}, the shape a page
 * definition already has) and a menu leaf ({@code RuleLink} with a {@code RunAction} rule) runs one
 * of them. The wire App carries every declared action with its flow LOWERED to commands, so the
 * client applies them with no server round-trip — which is what makes the menu work in a static
 * bundle and in the visual editor's Play.
 *
 * <p>Also the Java golden of the browser expander's {@code expandAppShell} (actions, widgets and
 * the header switches): run with {@code -Dmateu.golden.write=true} to refresh {@code
 * app-shell.golden.json}.
 */
class AppShellFlowSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  private static UIIncrementDto loadShell() {
    var thread = Thread.currentThread();
    var previous = thread.getContextClassLoader();
    thread.setContextClassLoader(
        new MountHomeSyncTest.SpecsOverlay(
            "shell-flows", AppShellFlowSyncTest.class.getClassLoader()));
    try (var mateu = TestMateu.withUis()) {
      return mateu.run(
          RunActionRqDto.builder().route("/").consumedRoute("_empty").actionId("").build());
    } finally {
      thread.setContextClassLoader(previous);
    }
  }

  private static AppDto appOf(UIIncrementDto increment) {
    var component = (ClientSideComponentDto) increment.fragments().get(0).component();
    return (AppDto) component.metadata();
  }

  @Test
  void theWireAppCarriesTheShellFlowsLoweredToCommands() throws Exception {
    var increment = loadShell();
    var app = appOf(increment);

    assertThat(app.actions()).extracting(a -> a.id()).containsExactly("newOrder", "announce");
    var newOrder = app.actions().get(0);
    assertThat(newOrder.commands())
        .extracting(c -> c.type())
        .containsExactly(UICommandTypeDto.MarkAsClean, UICommandTypeDto.NavigateTo);
    assertThat(newOrder.commands().get(1).data()).isEqualTo("orders/new");
    assertThat(app.actions().get(1).commands())
        .extracting(c -> c.type())
        .containsExactly(UICommandTypeDto.DispatchEvent);

    // The menu leaf keeps the existing authoring shape: a RuleLink whose RunAction rule names it.
    var leaf =
        app.menu().stream().filter(o -> "New order".equals(o.label())).findFirst().orElseThrow();
    assertThat(leaf.rules()).hasSize(1);
    assertThat(leaf.rules().get(0).actionId()).isEqualTo("newOrder");

    maybeWriteGolden(increment);
  }

  @Test
  void theHeaderSwitchesAndWidgetsOfAYamlShellReachTheWire() {
    var increment = loadShell();
    var app = appOf(increment);
    assertThat(app.themeToggle()).isTrue();
    assertThat(app.commandCenterEnabled()).isTrue();
    assertThat(app.accessKeys()).isTrue();
    assertThat(app.chromeless()).isFalse();
    var shell = (ClientSideComponentDto) increment.fragments().get(0).component();
    assertThat(shell.children()).hasSize(1);
    assertThat(((ClientSideComponentDto) shell.children().get(0)).slot()).isEqualTo("widgets");
  }

  @Test
  void aShellBuiltInCodeCarriesItsActionsTheSameWay() {
    var shell =
        AppShell.builder()
            .title("Code shell")
            .menuItem(new RouteLink("home", "Home"))
            .action(Action.builder().id("goHome").steps(List.of(new Step.Navigate("home"))).build())
            .themeToggle(true)
            .build();
    assertThat(shell.actions()).hasSize(1);
    assertThat(shell.actions().get(0).steps()).hasSize(1);
    // A shell that declares nothing keeps an empty list and leaves the switches to @App.
    var bare = AppShell.builder().build();
    assertThat(bare.actions()).isEmpty();
    assertThat(bare.themeToggle()).isNull();
  }

  private static void maybeWriteGolden(UIIncrementDto increment) throws Exception {
    if (!Boolean.getBoolean("mateu.golden.write")) return;
    JsonNode tree = JSON.valueToTree(increment);
    var target =
        Path.of(
            "../../../frontend/web/monorepo/libs/mateu/src/mateu/ui/infra/expander/__fixtures__/app-shell.golden.json");
    Files.writeString(target, JSON.writerWithDefaultPrettyPrinter().writeValueAsString(tree));
  }
}
