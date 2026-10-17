package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The guards on every wizard move: Next and the completion action refuse a step whose required
 * fields are empty (naming them); the {@code beforeStepNavigate} veto cancels Back, Skip, a jump to
 * a visited step and the completion too; Skip on a step that is not skippable and the draft actions
 * on a wizard that is not {@code Draftable} do nothing; and a completion returning something other
 * than a message (a URI) answers with it.
 */
class WizardGuardsSyncTest {

  public static class Who implements WizardStep {
    @NotEmpty public String name = "";
  }

  public static class What implements WizardStep {
    public String note = "n";
  }

  public static class Confirm implements WizardStep {
    @NotEmpty public String code = "";
  }

  public static class Result implements WizardStep {
    @PlainText public String outcome = "pending";
  }

  static volatile boolean veto;

  @UI("/guarded-wizard")
  @Title("Guarded")
  public static class GuardedWizard extends Wizard {
    Who who = new Who();
    What what = new What();
    Confirm confirm = new Confirm();
    Result result;

    @Override
    protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
      return veto ? Message.error("blocked " + fromStep + " -> " + toStep) : null;
    }

    @WizardCompletionAction
    Object finish() {
      return URI.create("/guarded-wizard/done");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(GuardedWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @AfterEach
  void noVeto() {
    veto = false;
  }

  private static UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/guarded-wizard")
            .actionId(actionId)
            .serverSideType(GuardedWizard.class.getName())
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static UIIncrementDto run(String actionId, Map<String, Object> state) {
    return run(actionId, state, Map.of());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> map && map.containsKey("position")) {
        return new HashMap<>((Map<String, Object>) map);
      }
    }
    throw new AssertionError("no wizard state in " + increment);
  }

  private static String messages(UIIncrementDto increment) {
    return String.valueOf(increment.messages());
  }

  /** Walks to the confirmation step (position 2) with valid answers. */
  private static Map<String, Object> atConfirm() {
    var state = state(mateu.sync("/guarded-wizard"));
    state.put("name", "Ada");
    var second = state(run("next", state));
    return state(run("next", second));
  }

  @Test
  void nextRefusesAStepWithEmptyRequiredFieldsAndNamesThem() {
    var state = state(mateu.sync("/guarded-wizard"));
    var refused = run("next", state);
    assertThat(messages(refused)).contains("Fill in the required fields").contains("Name");
    assertThat(refused.fragments()).noneMatch(f -> f.component() != null);
  }

  @Test
  void theCompletionActionRefusesTheCurrentStepsEmptyRequiredFields() {
    var confirm = atConfirm();
    assertThat(confirm).containsEntry("position", 2);
    var refused = run("finish", confirm);
    assertThat(messages(refused)).contains("Fill in the required fields").contains("Code");
  }

  @Test
  void aCompletionReturningAUriAnswersWithIt() {
    var confirm = atConfirm();
    confirm.put("code", "X1");
    var done = run("finish", confirm);
    assertThat(String.valueOf(done)).contains("/guarded-wizard/done");
  }

  @Test
  void theVetoCancelsBackAJumpBackAndTheCompletion() {
    var confirm = atConfirm();
    confirm.put("code", "X1");
    veto = true;

    assertThat(messages(run("back", confirm))).contains("blocked confirm -> what");
    assertThat(messages(run("goToStep", confirm, Map.of("_stepId", "who"))))
        .contains("blocked confirm -> who");
    assertThat(messages(run("finish", confirm))).contains("blocked confirm -> result");
  }

  @Test
  void jumpingBackToAVisitedStepMovesThere() {
    var confirm = atConfirm();
    var jumped = state(run("goToStep", confirm, Map.of("_stepId", "who")));
    assertThat(jumped).containsEntry("position", 0);
    // an unknown or not-yet-visited step leaves the wizard where it was
    assertThat(state(run("goToStep", confirm, Map.of("_stepId", "result"))))
        .containsEntry("position", 2);
  }

  @Test
  void skipAndDraftsDoNothingWhereTheyDoNotApply() {
    var confirm = atConfirm();
    assertThat(state(run("skip", confirm))).containsEntry("position", 2);
    var draft = run("saveDraft", confirm);
    assertThat(state(draft)).containsEntry("position", 2);
    assertThat(draft.messages()).isEmpty();
    assertThat(state(run("saveAndClose", confirm))).containsEntry("position", 2);
  }
}
