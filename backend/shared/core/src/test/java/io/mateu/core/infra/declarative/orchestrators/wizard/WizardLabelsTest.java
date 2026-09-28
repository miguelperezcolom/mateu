package io.mateu.core.infra.declarative.orchestrators.wizard;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.uidl.annotations.WizardLabels;
import io.mateu.uidl.data.Button;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * The wizard's built-in Back / Next buttons are localizable like every other Mateu text: through
 * the app's Translator by default, or fixed by the wizard with {@code @WizardLabels}.
 */
class WizardLabelsTest {

  static class StepOne implements WizardStep {
    String name;
  }

  static class StepTwo implements WizardStep {
    String email;
  }

  static class Result implements WizardStep {
    String message;
  }

  static class PlainWizard extends Wizard {
    StepOne one;
    StepTwo two;
    Result result;
  }

  @WizardLabels(back = "Atrás", next = "Siguiente")
  static class SpanishWizard extends Wizard {
    StepOne one;
    StepTwo two;
    Result result;
  }

  @AfterEach
  void clear() {
    TranslatorContext.clear();
  }

  private static Map<String, String> labels(Wizard wizard) {
    return WizardButtonBuilder.createButtons(wizard, null).stream()
        .map(Button.class::cast)
        .collect(
            java.util.stream.Collectors.toMap(
                b -> b.id() != null ? b.id() : b.actionId(), Button::label));
  }

  @Test
  void backAndNextDefaultToEnglish() {
    assertThat(labels(new PlainWizard()))
        .containsEntry("back", "Back")
        .containsEntry("next", "Next");
  }

  @Test
  void backAndNextGoThroughTheAppsTranslator() {
    var es = Map.of("Back", "Atrás", "Next", "Siguiente");
    TranslatorContext.set((text, rq) -> es.getOrDefault(text, text), null);
    assertThat(labels(new PlainWizard()))
        .containsEntry("back", "Atrás")
        .containsEntry("next", "Siguiente");
  }

  /**
   * Whatever the label says, the buttons run {@code back} and {@code next}: with a localized label
   * and no action id the wire derived the action from the label, and «Siguiente» sent {@code
   * siguiente}, which no wizard knows — the walk-in did not move and showed nothing.
   */
  @Test
  void localizedButtonsStillRunBackAndNext() {
    var buttons =
        WizardButtonBuilder.createButtons(new SpanishWizard(), null).stream()
            .map(Button.class::cast)
            .toList();
    assertThat(buttons)
        .extracting(Button::id, Button::actionId, Button::label)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("back", "back", "Atrás"),
            org.assertj.core.groups.Tuple.tuple("next", "next", "Siguiente"));
    // back is disabled on the first step; next is the call to action
    assertThat(buttons.get(0).disabled()).isTrue();
    assertThat(buttons.get(1).buttonStyle()).isEqualTo(io.mateu.uidl.data.ButtonStyle.primary);
  }

  @Test
  void aWizardCanSetItsOwnLabels() {
    assertThat(labels(new SpanishWizard()))
        .containsEntry("back", "Atrás")
        .containsEntry("next", "Siguiente");
  }
}
