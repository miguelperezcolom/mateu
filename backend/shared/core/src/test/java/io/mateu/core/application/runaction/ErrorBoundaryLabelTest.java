package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Label;
import jakarta.validation.Validation;
import jakarta.validation.constraints.NotEmpty;
import org.junit.jupiter.api.Test;

/**
 * A server-side validation message names the field as the USER knows it — its @Label, else its name
 * humanized — never by its programmer id ("startDate: must not be empty"). UX review.
 */
class ErrorBoundaryLabelTest {

  static class Booking {
    @NotEmpty String startDate;

    @Label("Guest name")
    @NotEmpty
    String guest;
  }

  @Test
  void humanizesAFieldIdWhenThereIsNoLabel() {
    assertThat(ErrorBoundary.humanize("startDate")).isEqualTo("Start date");
    assertThat(ErrorBoundary.humanize("check_out")).isEqualTo("Check out");
    assertThat(ErrorBoundary.humanize("status")).isEqualTo("Status");
  }

  @Test
  void aViolationIsNamedByTheFieldsLabelOrItsHumanizedName() {
    try (var factory =
        Validation.byDefaultProvider()
            .configure()
            .messageInterpolator(
                new org.hibernate.validator.messageinterpolation.ParameterMessageInterpolator())
            .buildValidatorFactory()) {
      var violations = factory.getValidator().validate(new Booking());
      assertThat(violations)
          .extracting(ErrorBoundary::labelOf)
          .containsExactlyInAnyOrder("Start date", "Guest name");
    }
  }
}
