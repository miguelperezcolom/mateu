package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ProgressBarDto;
import io.mateu.dtos.ProgressStepsDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardProgress;
import io.mateu.uidl.annotations.WizardProgressStyle;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Wizard progress styles: the default wizard shows the classic progress bar, and
 * a @WizardProgress(STEPS) wizard shows connected step bullets (the ProgressSteps component) with
 * one dot per non-result step carrying done/current/upcoming states.
 */
class WizardProgressStyleSyncTest {

  public static class Uno implements WizardStep {
    public String a = "";
  }

  public static class Dos implements WizardStep {
    public String b = "";
  }

  public static class Resultado implements WizardStep {
    public String outcome = "ok";
  }

  @SuppressWarnings("unused")
  @UI("/wizard-bar")
  @Title("Bar")
  public static class BarWizard extends Wizard {
    @Label("Paso uno")
    Uno uno = new Uno();

    @Label("Paso dos")
    Dos dos = new Dos();

    Resultado resultado;

    @WizardCompletionAction
    @Label("Finish")
    Object finish() {
      return null;
    }
  }

  @SuppressWarnings("unused")
  @UI("/wizard-steps")
  @Title("Steps")
  @WizardProgress(WizardProgressStyle.STEPS)
  public static class StepsWizard extends Wizard {
    @Label("Paso uno")
    Uno uno = new Uno();

    @Label("Paso dos")
    Dos dos = new Dos();

    Resultado resultado;

    @WizardCompletionAction
    @Label("Finish")
    Object finish() {
      return null;
    }
  }

  @SuppressWarnings("unused")
  @UI("/wizard-rail")
  @Title("Rail")
  @WizardProgress(WizardProgressStyle.RAIL)
  public static class RailWizard extends Wizard {
    @Label("Paso uno")
    Uno uno = new Uno();

    @Label("Paso dos")
    Dos dos = new Dos();

    Resultado resultado;

    @WizardCompletionAction
    @Label("Finish")
    Object finish() {
      return null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BarWizard.class, StepsWizard.class, RailWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void defaultWizardKeepsTheProgressBar() {
    var increment = mateu.sync("/wizard-bar");
    var root = increment.fragments().get(0).component();
    assertThat(FieldKindsSyncTest.collect(root, ProgressBarDto.class)).isNotEmpty();
    assertThat(FieldKindsSyncTest.collect(root, ProgressStepsDto.class)).isEmpty();
  }

  @Test
  void stepsWizardShowsConnectedBulletsWithStepStates() {
    var increment = mateu.sync("/wizard-steps");
    var root = increment.fragments().get(0).component();
    assertThat(FieldKindsSyncTest.collect(root, ProgressBarDto.class)).isEmpty();
    var steppers = FieldKindsSyncTest.collect(root, ProgressStepsDto.class);
    assertThat(steppers).hasSize(1);
    // one bullet per non-result step, the first one current
    assertThat(steppers.get(0).steps())
        .extracting(s -> s.title(), s -> s.status())
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("Paso uno", "current"),
            org.assertj.core.groups.Tuple.tuple("Paso dos", "upcoming"));
    assertThat(steppers.get(0).vertical()).isFalse();
  }

  @Test
  void railWizardShowsTheVerticalStepListAndTheCounter() {
    var increment = mateu.sync("/wizard-rail");
    var root = increment.fragments().get(0).component();
    assertThat(FieldKindsSyncTest.collect(root, ProgressBarDto.class)).isEmpty();
    var steppers = FieldKindsSyncTest.collect(root, ProgressStepsDto.class);
    assertThat(steppers).hasSize(1);
    assertThat(steppers.get(0).vertical()).isTrue();
    assertThat(steppers.get(0).steps())
        .extracting(s -> s.title(), s -> s.status())
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("Paso uno", "current"),
            org.assertj.core.groups.Tuple.tuple("Paso dos", "upcoming"));
    // the rail leads with the big "current | total" counter
    var texts = FieldKindsSyncTest.collect(root, io.mateu.dtos.TextDto.class);
    assertThat(texts).anySatisfy(text -> assertThat(text.text()).isEqualTo("1 | 2"));
  }
}
