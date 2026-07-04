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

    boolean includeB = true;

    @Override
    protected boolean stepApplies(String stepFieldName) {
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
