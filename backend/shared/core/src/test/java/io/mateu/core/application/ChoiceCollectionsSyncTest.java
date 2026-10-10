package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A List/Set of enum constants with a multi-choice stereotype is ONE form field (dataType array,
 * the enum constants as options) whose chosen values round-trip — a guest's room preferences. It
 * used to become a grid (List) or an empty nested form (Set), so the field vanished.
 */
class ChoiceCollectionsSyncTest {

  public enum Preference {
    HIGH_FLOOR,
    QUIET_ROOM,
    NEAR_LIFT
  }

  @SuppressWarnings("unused")
  @UI("/choices")
  @Title("Choices")
  public static class ChoicesForm {
    @Stereotype(FieldStereotype.multiSelect)
    Set<Preference> preferences = Set.of(Preference.QUIET_ROOM);

    @Stereotype(FieldStereotype.checkbox)
    List<Preference> extras = List.of();

    @Button
    public Message echo() {
      return new Message(new TreeSet<>(preferences) + " / " + extras);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ChoicesForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<FormFieldDto> fields() {
    var found = new ArrayList<FormFieldDto>();
    FieldKindsSyncTest.walk(
        mateu.sync("/choices").fragments().get(0).component(), FormFieldDto.class, found);
    return found;
  }

  @Test
  void anEnumCollectionWithAMultiChoiceStereotypeIsOneFieldWithTheConstantsAsOptions() {
    var byId = new java.util.HashMap<String, FormFieldDto>();
    fields().forEach(f -> byId.put(f.fieldId(), f));
    assertThat(byId).containsKeys("preferences", "extras");
    var preferences = byId.get("preferences");
    assertThat(preferences.dataType()).isEqualTo("array");
    assertThat(preferences.stereotype()).isEqualTo("multiSelect");
    assertThat(preferences.options())
        .extracting(o -> o.value())
        .containsExactly("HIGH_FLOOR", "QUIET_ROOM", "NEAR_LIFT");
    assertThat(byId.get("extras").stereotype()).isEqualTo("checkbox");
    assertThat(byId.get("extras").options()).hasSize(3);
  }

  @Test
  void theChosenConstantsRoundTripIntoTheSetAndTheList() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/choices")
                .consumedRoute("/choices")
                .actionId("echo")
                .serverSideType(ChoicesForm.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(
                    Map.of(
                        "preferences", List.of("HIGH_FLOOR", "NEAR_LIFT"),
                        "extras", List.of("QUIET_ROOM")))
                .build());
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .containsExactly("[HIGH_FLOOR, NEAR_LIFT] / [QUIET_ROOM]");
  }
}
