package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Negative;
import jakarta.validation.constraints.NegativeOrZero;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@code @Email}, {@code @Positive}, {@code @PositiveOrZero}, {@code @Negative}, {@code
 * NegativeOrZero}, {@code @DecimalMin} and {@code @DecimalMax} travel to the client as validations
 * and are re-checked by the server before a validated action, like {@code @Pattern} and {@code
 * Min}/{@code Max}. They were ignored on both sides: {@code pepe} went through an {@code @Email}
 * field. An empty optional value passes them all, as in Bean Validation.
 */
class EmailAndSignConstraintsSyncTest {

  @UI("/email-and-sign")
  public static class Signup {
    @Email String email;

    @Email(regexp = ".*@example\\.com$", message = "Only example.com")
    String workEmail;

    @Positive Integer seats;

    @PositiveOrZero Integer children;

    @Negative Integer delta;

    @NegativeOrZero Integer adjustment;

    @DecimalMin("0.5")
    BigDecimal weight;

    @DecimalMax(value = "10", inclusive = false)
    BigDecimal ratio;

    @Button
    Message save() {
      return new Message("saved");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Signup.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/email-and-sign")
            .actionId("save")
            .serverSideType(Signup.class.getName())
            .componentState(state)
            .initiatorComponentId("app")
            .build());
  }

  private static MessageDto message(UIIncrementDto increment) {
    assertThat(increment.messages()).hasSize(1);
    return increment.messages().get(0);
  }

  @Test
  void eachConstraintTravelsAsAValidationOfItsField() {
    var component =
        (ServerSideComponentDto) mateu.sync("/email-and-sign").fragments().get(0).component();
    var byField = new HashMap<String, List<String>>();
    var messages = new HashMap<String, String>();
    component
        .validations()
        .forEach(
            v -> {
              byField.computeIfAbsent(v.fieldId(), k -> new ArrayList<>()).add(v.condition());
              messages.put(v.fieldId(), v.message());
            });

    assertThat(byField.get("email"))
        .containsExactly(
            "state['email'] == null || state['email'] === '' || (/^[^@\\s]+@[^@\\s]+$/.test(state['email']))");
    assertThat(messages.get("email")).isEqualTo("must be a well-formed email address");
    // the @Email's own regexp must match too
    assertThat(byField.get("workEmail").get(0)).contains("/.*@example\\.com$/.test(");
    assertThat(messages.get("workEmail")).isEqualTo("Only example.com");
    assertThat(byField.get("seats"))
        .containsExactly("state['seats'] == null || state['seats'] === '' || state['seats'] > 0");
    assertThat(byField.get("children").get(0)).endsWith("state['children'] >= 0");
    assertThat(byField.get("delta").get(0)).endsWith("state['delta'] < 0");
    assertThat(byField.get("adjustment").get(0)).endsWith("state['adjustment'] <= 0");
    assertThat(byField.get("weight").get(0)).endsWith("state['weight'] >= 0.5");
    assertThat(messages.get("weight")).isEqualTo("must be greater than or equal to 0.5");
    assertThat(byField.get("ratio").get(0)).endsWith("state['ratio'] < 10");
    assertThat(messages.get("ratio")).isEqualTo("must be less than 10");
  }

  @Test
  void validValuesAndEmptyOptionalOnesRunTheAction() {
    assertThat(message(run(Map.of())).text()).isEqualTo("saved");
    var state = new HashMap<String, Object>();
    state.put("email", "ana@example.com");
    state.put("workEmail", "ana@example.com");
    state.put("seats", 1);
    state.put("children", 0);
    state.put("delta", -1);
    state.put("adjustment", 0);
    state.put("weight", 0.5);
    state.put("ratio", 9.99);
    assertThat(message(run(state)).text()).isEqualTo("saved");
  }

  @Test
  void theServerRefusesWhatTheClientWouldHaveRefused() {
    var state = new HashMap<String, Object>();
    state.put("email", "pepe");
    state.put("workEmail", "ana@other.org");
    state.put("seats", 0);
    state.put("children", -1);
    state.put("delta", 0);
    state.put("adjustment", 1);
    state.put("weight", 0.49);
    state.put("ratio", 10);

    var message = message(run(state));

    assertThat(message.title()).isEqualTo("There are validation errors");
    assertThat(message.text())
        .contains("• Email: must be a well-formed email address")
        .contains("• Work email: Only example.com")
        .contains("• Seats: must be greater than 0")
        .contains("• Children: must be greater than or equal to 0")
        .contains("• Delta: must be less than 0")
        .contains("• Adjustment: must be less than or equal to 0")
        .contains("• Weight: must be greater than or equal to 0.5")
        .contains("• Ratio: must be less than 10");
  }
}
