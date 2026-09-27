package io.mateu.core.application;

import static io.mateu.core.application.WizardCrossStepStateSyncTest.wire;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A list inside a wizard step: its "+" and its row editor's Save reach Mateu's list handlers, not
 * the wizard's next/back. The list is a field of the step the user is on, so it is looked up there;
 * the wizard's position and what earlier steps hold stay as they were.
 */
class WizardStepListSyncTest {

  public static class Stay implements WizardStep {
    public String hotel;
  }

  public record Room(String type, int adults) {}

  public static class RoomsStep implements WizardStep {
    public List<Room> rooms = new ArrayList<>();
  }

  public static class Notes implements WizardStep {
    public String note;
  }

  /** The last step is the result, reached only by finishing. */
  public static class Done implements WizardStep {
    public String outcome;
  }

  @SuppressWarnings("unused")
  @UI("/probe-list-wizard")
  @Title("Probe")
  public static class ListWizard extends Wizard {
    Stay stay = new Stay();
    RoomsStep roomsStep = new RoomsStep();
    Notes notes = new Notes();
    Done done;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ListWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aStepsListAddsARowAndTheWizardStaysWhereItWas() throws Exception {
    var first = mateu.sync("/probe-list-wizard");
    var s1 = wire(state(first));
    s1.put("hotel", "MRU01");
    var second = run("next", s1, Map.of());
    assertThat(state(second)).containsEntry("position", 1);

    // "+" opens the row editor for the step's list — not the wizard's next/back
    var added = run("rooms_add", wire(state(second)), Map.of());
    assertThat(added.fragments()).anyMatch(f -> "rooms-container".equals(f.targetComponentId()));

    // the row editor's Save: the holder's state, the row in initiatorState
    var holder = wire(mergedState(added));
    var created =
        run("rooms_create", holder, Map.of("initiatorState", Map.of("type", "SWU", "adults", 2)));
    var after = mergedState(created);
    assertThat(after).containsEntry("position", 1);
    assertThat(after.get("rooms")).isInstanceOf(List.class);
    @SuppressWarnings("unchecked")
    var rooms = (List<Map<String, Object>>) after.get("rooms");
    assertThat(rooms).hasSize(1);
    assertThat(rooms.get(0)).containsEntry("type", "SWU").containsEntry("adults", 2);
    assertThat(nested(after, "stay")).containsEntry("hotel", "MRU01");

    // and the row survives the next step: the wizard rebuilt the step from it
    var third = run("next", wire(after), Map.of());
    System.out.println("AFTER=" + after);
    System.out.println(
        "THIRD=" + third.messages() + " frags=" + third.fragments().size() + " " + state(third));
    var thirdState = state(third);
    assertThat(thirdState).containsEntry("position", 2);
    @SuppressWarnings("unchecked")
    var kept = (List<Map<String, Object>>) nested(thirdState, "roomsStep").get("rooms");
    assertThat(kept).hasSize(1);
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> params) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/probe-list-wizard")
            .actionId(actionId)
            .serverSideType(ListWizard.class.getName())
            .componentState(state)
            .parameters(params)
            .build());
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> state(UIIncrementDto increment) {
    return (Map<String, Object>) increment.fragments().get(0).state();
  }

  /** The holder's state after an increment: what the client merges from the fragments' states. */
  @SuppressWarnings("unchecked")
  private static Map<String, Object> mergedState(UIIncrementDto increment) {
    var merged = new HashMap<String, Object>();
    increment.fragments().stream()
        .filter(f -> !"rooms-container".equals(f.targetComponentId()) && f.state() instanceof Map)
        .forEach(f -> merged.putAll((Map<String, Object>) f.state()));
    return merged;
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> nested(Map<String, Object> state, String key) {
    assertThat(state.get(key)).isInstanceOf(Map.class);
    return (Map<String, Object>) state.get(key);
  }
}
