package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@code @Toolbar} method of the step on screen is a button of the wizard, and clicking it RUNS
 * it — on that step, with what the user typed — and shows the step again with whatever it changed.
 * The button used to be drawn and then ignored: the wizard's dispatcher only knew its navigation
 * and its completion actions.
 */
class WizardStepToolbarSyncTest {

  public static class NameStep implements WizardStep {
    public String name = "";

    @Toolbar
    @Label("Suggest")
    public void suggest() {
      name = name.isBlank() ? "Grace" : name + " Hopper";
    }

    @Toolbar
    @Label("Check")
    public Message check(HttpRequest httpRequest) {
      return Message.success("Looks good, " + name);
    }
  }

  public static class AgeStep implements WizardStep {
    public int age = 30;
  }

  public static class Done implements WizardStep {
    public String outcome;
  }

  @SuppressWarnings("unused")
  @UI("/toolbar-wizard")
  @Title("Toolbar wizard")
  public static class ToolbarWizard extends Wizard {
    NameStep nameStep = new NameStep();
    AgeStep ageStep = new AgeStep();
    Done done;

    @WizardCompletionAction
    Object finish() {
      return null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ToolbarWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/toolbar-wizard")
            .actionId(actionId)
            .serverSideType(ToolbarWizard.class.getName())
            .componentState(state)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.state())
        .filter(state -> state instanceof Map<?, ?>)
        .map(state -> new HashMap<>((Map<String, Object>) state))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void theStepsToolbarActionIsAdvertised() {
    var component =
        (ServerSideComponentDto) mateu.sync("/toolbar-wizard").fragments().get(0).component();
    assertThat(component.actions()).extracting(a -> a.id()).contains("suggest", "check");
  }

  @Test
  void aStepToolbarMethodRunsOnTheTypedValuesAndTheStepShowsWhatItChanged() {
    var state = stateOf(mateu.sync("/toolbar-wizard"));
    state.put("name", "Ada");
    var after = run("suggest", state);
    var newState = stateOf(after);
    assertThat(newState).containsEntry("name", "Ada Hopper").containsEntry("position", 0);
  }

  @Test
  void aStepToolbarMethodsMessageShowsAndTheWizardStaysOnTheStep() {
    var state = stateOf(mateu.sync("/toolbar-wizard"));
    state.put("name", "Ada");
    var after = run("check", state);
    assertThat(after.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("Looks good, Ada"));
    assertThat(stateOf(after)).containsEntry("position", 0).containsEntry("name", "Ada");
  }
}
