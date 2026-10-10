package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.LongTask;
import io.mateu.uidl.data.Message;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/**
 * A {@code @WizardCompletionAction} that returns a {@link LongTask} streams its progress and then
 * lands on the result step, exactly like one returning null — the progress used to be the whole
 * answer and the wizard stayed on the penultimate step.
 */
class WizardLongTaskSyncTest {

  public static class ParamsStep implements WizardStep {
    public int rounds = 3;
  }

  public static class Outcome implements WizardStep {
    @PlainText public String summary = "pending";
  }

  @SuppressWarnings("unused")
  @UI("/long-task-wizard")
  @Title("Long task wizard")
  public static class LongTaskWizard extends Wizard {
    ParamsStep params = new ParamsStep();
    Outcome outcome;

    @WizardCompletionAction
    @Label("Run")
    public Flux<?> run() {
      if (params.rounds <= 0) {
        return Flux.just(Message.error("Nothing to run"));
      }
      return LongTask.create("Running")
          .withProgressBar()
          .done("Done", "All rounds finished")
          .run(
              progress ->
                  Flux.range(1, params.rounds)
                      .map(
                          i -> {
                            if (i == params.rounds) {
                              outcome = new Outcome();
                              outcome.summary = params.rounds + " rounds";
                            }
                            return progress.step("Round " + i, i / (double) params.rounds);
                          }));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(LongTaskWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theCompletionActionIsAdvertisedAsStreamed() {
    var component =
        (ServerSideComponentDto) mateu.sync("/long-task-wizard").fragments().get(0).component();

    assertThat(component.actions())
        .anySatisfy(
            action -> {
              assertThat(action.id()).isEqualTo("run");
              assertThat(action.sse()).isTrue();
              assertThat(action.validationRequired()).isTrue();
            });
  }

  @Test
  void theProgressStreamsAndTheWizardThenLandsOnTheResultStep() {
    var first = mateu.sync("/long-task-wizard");
    var state = new HashMap<>(state(first));
    state.put("rounds", 2);

    var increments =
        mateu.runAll(
            RunActionRqDto.builder()
                .route("/long-task-wizard")
                .actionId("run")
                .serverSideType(LongTaskWizard.class.getName())
                .componentState(state)
                .build());

    // the progress dialog + its steps + the closing state come first ...
    assertThat(increments.size()).isGreaterThan(2);
    // ... and the LAST increment is the wizard re-rendered on its result step
    var last = increments.get(increments.size() - 1);
    var component = last.fragments().get(0).component();
    assertThat(component).isInstanceOf(ServerSideComponentDto.class);
    assertThat(((ServerSideComponentDto) component).serverSideType())
        .isEqualTo(LongTaskWizard.class.getName());
    assertThat(state(last)).containsEntry("position", 1).containsEntry("summary", "2 rounds");
  }

  @Test
  void aStreamThatReportsAnErrorStaysOnTheStep() {
    var state = new HashMap<>(state(mateu.sync("/long-task-wizard")));
    state.put("rounds", 0);

    var increments =
        mateu.runAll(
            RunActionRqDto.builder()
                .route("/long-task-wizard")
                .actionId("run")
                .serverSideType(LongTaskWizard.class.getName())
                .componentState(state)
                .build());

    assertThat(increments).hasSize(1);
    assertThat(increments.get(0).messages()).isNotEmpty();
    assertThat(increments.get(0).fragments()).isEmpty();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>) increment.fragments().get(0).state();
  }

  @Test
  void aProgressStepNeverBecomesTheWindowTitle() {
    var state = new HashMap<>(state(mateu.sync("/long-task-wizard")));
    state.put("rounds", 2);

    var increments =
        mateu.runAll(
            RunActionRqDto.builder()
                .route("/long-task-wizard")
                .actionId("run")
                .serverSideType(LongTaskWizard.class.getName())
                .componentState(state)
                .build());

    assertThat(increments)
        .flatMap(increment -> increment.commands())
        .noneSatisfy(
            command -> assertThat(String.valueOf(command.data())).startsWith("UIFragmentDto["));
  }
}
