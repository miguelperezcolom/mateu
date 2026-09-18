package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Step;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A declared client-side flow (coherence-plan #3, Phase 2): a fluent {@link Action} may carry a
 * list of {@link Step}s, and each lowers to an existing wire command on {@code ActionDto.commands}.
 * The frontend runs those with the command applier it already has — no server round-trip. This pins
 * that the steps reach the wire as commands (the server half); the client half is a vitest of
 * mateu-component.
 */
class ActionFlowSyncTest {

  @SuppressWarnings("unused")
  @UI("/action-flow")
  public static class ActionFlowForm implements ActionSupplier {
    String name = "n";

    @Override
    public List<Action> actions(HttpRequest httpRequest) {
      return List.of(
          Action.builder()
              .id("saveAndClose")
              .steps(
                  List.of(
                      new Step.MarkClean(),
                      new Step.CloseOverlay("saved"),
                      new Step.Navigate("/orders")))
              .build(),
          // a normal action carries no flow → no commands member
          Action.builder().id("plain").build());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ActionFlowForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ActionDto action(String id) {
    var increment = mateu.sync("/action-flow");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    return component.actions().stream().filter(a -> id.equals(a.id())).findFirst().orElseThrow();
  }

  @Test
  void aDeclaredFlowLowersItsStepsToCommandsOnTheActionDto() {
    var action = action("saveAndClose");
    assertThat(action.commands()).hasSize(3);
    assertThat(action.commands())
        .extracting(c -> c.type())
        .containsExactly(
            UICommandTypeDto.MarkAsClean, UICommandTypeDto.CloseModal, UICommandTypeDto.NavigateTo);
    assertThat(action.commands().get(2).data()).isEqualTo("/orders");
    // targetComponentId is left null so the client applies each command on the firing component.
    assertThat(action.commands().get(0).targetComponentId()).isNull();
  }

  @Test
  void anActionWithoutAFlowCarriesNoCommands() {
    assertThat(action("plain").commands()).isNull();
  }

  @Test
  void closeOverlayStepCarriesTheNamedResultEvent() {
    var close = action("saveAndClose").commands().get(1);
    assertThat(close.type()).isEqualTo(UICommandTypeDto.CloseModal);
    // the CustomEventDto payload carries the event name the host page listens for
    assertThat(close.data().toString()).contains("saved");
  }
}
