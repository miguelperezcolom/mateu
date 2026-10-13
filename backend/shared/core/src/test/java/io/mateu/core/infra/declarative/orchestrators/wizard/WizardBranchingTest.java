package io.mateu.core.infra.declarative.orchestrators.wizard;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class WizardBranchingTest {

  static class StepA implements WizardStep {
    String value;
  }

  static class StepB implements WizardStep {
    String value;
  }

  static class StepC implements WizardStep {
    String value;
  }

  static class ResultStep implements WizardStep {
    String message;
  }

  static class BranchingWizard extends Wizard {
    StepA a = new StepA();
    StepB b = new StepB();
    StepC c = new StepC();
    ResultStep result;

    boolean includeA = true;
    boolean includeB = true;

    @Override
    protected boolean stepApplies(String stepFieldName) {
      if ("a".equals(stepFieldName)) {
        return includeA;
      }
      if ("b".equals(stepFieldName)) {
        return includeB;
      }
      return true;
    }
  }

  @Test
  void allStepsApplyByDefault() {
    var wizard = new BranchingWizard();
    assertThat(wizard.applicableSteps()).isEqualTo(4);
    assertThat(wizard.nextApplicable(0)).isEqualTo(1);
    assertThat(wizard.nextApplicable(2)).isEqualTo(-1); // next is the result → completion action
  }

  @Test
  void skippedStepIsJumpedOverInBothDirections() {
    var wizard = new BranchingWizard();
    wizard.includeB = false;
    assertThat(wizard.applicableSteps()).isEqualTo(3);
    assertThat(wizard.nextApplicable(0)).isEqualTo(2); // a → c, skipping b
    assertThat(wizard.previousApplicable(2)).isEqualTo(0); // c → a, skipping b
  }

  /**
   * The first step shown is not always step 0: when it is skipped, Back from the first applicable
   * step has nowhere to go (it used to land on the skipped step 0).
   */
  @Test
  void theFirstApplicableStepHasNoPrevious() {
    var wizard = new BranchingWizard();
    wizard.includeA = false;
    wizard.position = 1;
    assertThat(wizard.previousApplicable(1)).isEqualTo(1);
    assertThat(wizard.hasPreviousApplicable()).isFalse();
    assertThat(WizardButtonBuilder.createButtons(wizard, null))
        .map(io.mateu.uidl.data.Button.class::cast)
        .extracting(io.mateu.uidl.data.Button::actionId)
        .doesNotContain("back")
        .contains("next");
    wizard.position = 2;
    assertThat(wizard.hasPreviousApplicable()).isTrue();
  }

  @Test
  void resultStepAlwaysApplies() {
    var wizard = new BranchingWizard();
    wizard.includeB = false;
    assertThat(wizard.applies(3)).isTrue();
  }

  @Test
  void progressCountsOnlyApplicableSteps() {
    var wizard = new BranchingWizard();
    wizard.includeB = false;
    wizard.position = 2; // on c, having skipped b
    assertThat(wizard.applicablePosition()).isEqualTo(1);
  }
}
