package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The constraints of an {@code @Inline} nested form are the page's: its fields render as {@code
 * guest-name}, the client validates them with the page and the server re-checks them before a
 * validated action — the host's own and the nested section's. Neither side used to look below the
 * view's own fields, so an empty required guest name went through.
 */
class InlineConstraintsSyncTest {

  public static class Guest {
    @NotEmpty String name;

    String notes;

    @Button
    Message save() {
      return new Message("guest saved");
    }
  }

  @UI("/inline-constraints")
  public static class Booking {
    String reference = "B-1";

    @Inline Guest guest = new Guest();

    @Button
    Message confirm() {
      return new Message("confirmed");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Booking.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/inline-constraints")
            .actionId(actionId)
            .serverSideType(Booking.class.getName())
            .componentState(state)
            .initiatorComponentId("app")
            .build());
  }

  @Test
  void theNestedConstraintTravelsUnderThePrefixedFieldId() {
    var component =
        (ServerSideComponentDto) mateu.sync("/inline-constraints").fragments().get(0).component();
    assertThat(component.validations()).extracting(ValidationDto::fieldId).contains("guest-name");
    assertThat(
            component.validations().stream()
                .filter(v -> "guest-name".equals(v.fieldId()))
                .findFirst()
                .orElseThrow()
                .condition())
        .contains("state['guest-name']");
  }

  @Test
  void theServerRefusesAnEmptyNestedRequiredFieldForTheHostAndTheNestedAction() {
    var empty = Map.<String, Object>of("reference", "B-1", "guest", Map.of("name", ""));
    assertThat(run("confirm", empty).messages().get(0).title())
        .isEqualTo("There are validation errors");
    assertThat(run("nested-form-action-guest-save", empty).messages().get(0).title())
        .isEqualTo("There are validation errors");

    // what the browser sends: the flat `guest-name` key of the field it edited
    assertThat(run("confirm", Map.of("guest-name", "")).messages().get(0).text())
        .contains("Name: Cannot be empty");

    var filled = Map.<String, Object>of("reference", "B-1", "guest", Map.of("name", "Ana"));
    assertThat(run("confirm", filled).messages().get(0).text()).isEqualTo("confirmed");
  }
}
