package io.mateu.core.infra.declarative.orchestrators.wizard;

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
}
