package io.mateu.core.infra.declarative.orchestrators.wizard;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.NotificationVariant;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A wizard step is left only with its required fields filled in — checked by the server too, not
 * only by the browser: the Redwood renderer let the new-booking wizard move on with the hotel, the
 * channel, the dates and the holder empty.
 */
class WizardStepValidatorTest {

  record StayStep(
      @NotEmpty @Label("Hotel code") String hotelCode,
      @NotBlank String channelCode,
      @NotNull LocalDate arrival,
      String comments,
      @NotEmpty List<String> rooms,
      @NotNull @Hidden String internal,
      @NotNull @ReadOnly String computed)
      implements WizardStep {}

  @ReadOnly
  record SummaryStep(@NotNull String booking) implements WizardStep {}

  static class Result implements WizardStep {
    String message;
  }

  static class BookingWizard extends Wizard {
    StayStep stay;
    SummaryStep summary;
    Result result;
  }

  @Test
  void anEmptyStepMissesEveryRequiredField() {
    var step = new StayStep(null, "  ", null, null, List.of(), null, null);
    assertThat(WizardStepValidator.missingRequired(step, null))
        .containsExactly("Hotel code", "Channel code", "Arrival", "Rooms");
  }

  @Test
  void aFilledStepMissesNothing() {
    var step = new StayStep("H1", "WEB", LocalDate.now(), null, List.of("DBL"), null, null);
    assertThat(WizardStepValidator.missingRequired(step, null)).isEmpty();
  }

  @Test
  void aReadOnlyStepAndAStepNotYetCreatedAreNotChecked() {
    assertThat(WizardStepValidator.missingRequired(new SummaryStep(null), null)).isEmpty();
    assertThat(WizardStepValidator.missingRequired(StayStep.class, null)).isEmpty();
    assertThat(WizardStepValidator.missingRequired(null, null)).isEmpty();
  }

  @Test
  void leavingAStepWithEmptyRequiredFieldsIsAnError() {
    var wizard = new BookingWizard();
    wizard.stay = new StayStep("H1", null, null, null, List.of("DBL"), null, null);
    var message = WizardActionDispatcher.requiredMissing(wizard, null);
    assertThat(message).isNotNull();
    assertThat(message.variant()).isEqualTo(NotificationVariant.error);
    assertThat(message.text()).isEqualTo("Fill in the required fields: Channel code, Arrival");

    wizard.stay = new StayStep("H1", "WEB", LocalDate.now(), null, List.of("DBL"), null, null);
    assertThat(WizardActionDispatcher.requiredMissing(wizard, null)).isNull();
  }

  @Test
  void notBlankMarksAFieldRequiredToo() throws Exception {
    var field = StayStep.class.getDeclaredField("channelCode");
    assertThat(
            io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.isRequired(
                field, null, null))
        .isTrue();
  }
}
