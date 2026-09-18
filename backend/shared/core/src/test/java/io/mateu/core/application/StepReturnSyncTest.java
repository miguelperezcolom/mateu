package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Step;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The flow {@link Step} model made live (coherence-plan #3, Phase 2): a ModelView method may return
 * a {@code Step} or a {@code List<Step>}, and each step is lowered to its wire command on the
 * increment — additively, over the wire the frontend already understands. A returned Step is
 * behavior, not a view, so it produces commands, not a fragment.
 */
class StepReturnSyncTest {

  @SuppressWarnings("unused")
  @UI("/step-return")
  public static class StepReturnForm {
    String name = "n";

    @Action
    List<Step> doFlow() {
      return List.of(new Step.Navigate("/next"), new Step.Emit("done", Map.of("ok", true)));
    }

    @Action
    Step single() {
      return new Step.MarkClean();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(StepReturnForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDtoView run(String actionId) {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/step-return")
                .actionId(actionId)
                .serverSideType(StepReturnForm.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of())
                .build());
    return new UIIncrementDtoView(increment.commands(), increment.fragments());
  }

  private record UIIncrementDtoView(List<UICommandDto> commands, List<?> fragments) {}

  @Test
  void aListOfStepsIsLoweredToCommandsAndProducesNoFragment() {
    var r = run("doFlow");
    assertThat(r.commands()).extracting(UICommandDto::type).contains(UICommandTypeDto.NavigateTo);
    assertThat(r.commands())
        .extracting(UICommandDto::type)
        .contains(UICommandTypeDto.DispatchEvent);
    assertThat(r.commands())
        .filteredOn(c -> c.type() == UICommandTypeDto.NavigateTo)
        .extracting(UICommandDto::data)
        .contains("/next");
    assertThat(r.fragments()).as("returned steps are behavior, not a view").isEmpty();
  }

  @Test
  void aSingleStepIsLoweredToItsCommand() {
    var r = run("single");
    assertThat(r.commands()).extracting(UICommandDto::type).contains(UICommandTypeDto.MarkAsClean);
    assertThat(r.fragments()).isEmpty();
  }
}
