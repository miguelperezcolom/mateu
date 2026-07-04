package io.mateu.core.infra.declarative.orchestrators.wizard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

/**
 * The flattened-state wizard modes (ACCUMULATIVE / ACCORDION) must reject two steps that declare a
 * field with the same name, because they would collide in the single shared state map.
 */
class WizardStepInspectorTest {

  static class StepOne implements WizardStep {
    String name;
    int quantity;
  }

  static class StepTwo implements WizardStep {
    String name; // collides with StepOne.name
    String email;
  }

  static class StepThree implements WizardStep {
    String address;
    int zip;
  }

  static class CollidingWizard extends Wizard {
    StepOne one;
    StepTwo two;
  }

  static class CleanWizard extends Wizard {
    StepOne one;
    StepThree three;
  }

  @Test
  void throwsWhenTwoStepsShareAFieldName() {
    assertThatThrownBy(() -> WizardStepInspector.assertNoFieldNameCollisions(new CollidingWizard()))
        .isInstanceOf(IllegalStateException.class)
        .hasMessageContaining("CollidingWizard")
        .hasMessageContaining("name")
        .hasMessageContaining("StepOne")
        .hasMessageContaining("StepTwo");
  }

  @Test
  void passesWhenEveryStepFieldNameIsUnique() {
    assertThatCode(() -> WizardStepInspector.assertNoFieldNameCollisions(new CleanWizard()))
        .doesNotThrowAnyException();
  }

  @Test
  void getAnswerLinesReadsBackCompletedStepValues() {
    var wizard = new CleanWizard();
    var one = new StepOne();
    one.name = "Miguel";
    one.quantity = 3;
    wizard.one = one;

    var lines = WizardStepInspector.getAnswerLines(wizard, 0);

    assertThat(lines).extracting(WizardStepInspector.AnswerLine::value).contains("Miguel", "3");
  }

  @Test
  void getAnswerLinesSkipsNullValues() {
    var wizard = new CleanWizard();
    wizard.one = new StepOne(); // name null, quantity default 0

    var lines = WizardStepInspector.getAnswerLines(wizard, 0);

    // the null String field is skipped; the primitive int 0 is kept
    assertThat(lines).extracting(WizardStepInspector.AnswerLine::value).containsExactly("0");
  }
}
