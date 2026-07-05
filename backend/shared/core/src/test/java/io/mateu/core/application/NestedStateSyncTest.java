package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * State round-trips through NESTED structures: inline sub-forms, non-inline nested objects, lists
 * of nested rows, enum/temporal coercion, and nested-form actions
 * (nested-form-action-&lt;field&gt;-&lt;method&gt;).
 */
class NestedStateSyncTest {

  @SuppressWarnings("unused")
  public enum Priority {
    LOW,
    HIGH
  }

  @SuppressWarnings("unused")
  public static class Address {
    String street = "Main st";
    String city = "Palma";

    static String lastAction;

    @io.mateu.uidl.annotations.Toolbar
    void verify(HttpRequest httpRequest) {
      lastAction = "verified:" + city;
    }
  }

  @SuppressWarnings("unused")
  public static class Contact {
    String email = "a@b.c";
    String phone = "555";
  }

  @SuppressWarnings("unused")
  public static class TicketRow {
    String subject;
    Priority priority = Priority.LOW;

    public TicketRow() {}
  }

  @SuppressWarnings("unused")
  @UI("/nested")
  public static class NestedForm {
    String owner = "Ada";

    @Section("Dirección")
    @Inline
    Address address = new Address();

    @Tab("Contacto")
    Contact contact = new Contact();

    List<TicketRow> tickets = new ArrayList<>();

    Priority priority = Priority.LOW;
    LocalDateTime when;
    LocalTime at;

    static NestedForm seen;

    @Action
    void snapshot(HttpRequest httpRequest) {
      seen = this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(NestedForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/nested")
            .actionId(actionId)
            .serverSideType(NestedForm.class.getName())
            .componentState(state)
            .parameters(parameters)
            .initiatorComponentId("nf_app")
            .build());
  }

  // ── sync shape ──────────────────────────────────────────────────────────────

  @Test
  void syncFlattensInlineFieldsAndNestsTheRest() {
    var increment = mateu.sync("/nested");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state).containsEntry("owner", "Ada");
    // the nested objects travel as nested maps in the state
    assertThat(state.get("address")).isInstanceOf(Map.class);
    assertThat(state.get("contact")).isInstanceOf(Map.class);
  }

  // ── nested state hydration ──────────────────────────────────────────────────

  @Test
  void nestedMapsHydrateBackIntoNestedObjects() {
    NestedForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("owner", "Eva");
    state.put("address", Map.of("street", "Second st", "city", "Madrid"));
    state.put("contact", Map.of("email", "x@y.z", "phone", "666"));
    run("snapshot", state, null);
    assertThat(NestedForm.seen).isNotNull();
    assertThat(NestedForm.seen.owner).isEqualTo("Eva");
    assertThat(NestedForm.seen.address.city).isEqualTo("Madrid");
    assertThat(NestedForm.seen.contact.phone).isEqualTo("666");
  }

  @Test
  void listsOfNestedRowsHydrateWithEnumCoercion() {
    NestedForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put(
        "tickets",
        List.of(
            Map.of("subject", "First", "priority", "HIGH"),
            Map.of("subject", "Second", "priority", "LOW")));
    run("snapshot", state, null);
    assertThat(NestedForm.seen.tickets).hasSize(2);
    assertThat(NestedForm.seen.tickets.get(0).subject).isEqualTo("First");
    assertThat(NestedForm.seen.tickets.get(0).priority).isEqualTo(Priority.HIGH);
  }

  @Test
  void enumAndTemporalStringsCoerce() {
    NestedForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("priority", "HIGH");
    state.put("when", "2026-07-05T10:30:00");
    state.put("at", "10:30");
    run("snapshot", state, null);
    assertThat(NestedForm.seen.priority).isEqualTo(Priority.HIGH);
    assertThat(NestedForm.seen.when).isEqualTo(LocalDateTime.of(2026, 7, 5, 10, 30));
    assertThat(NestedForm.seen.at).isEqualTo(LocalTime.of(10, 30));
  }

  // ── nested-form actions ─────────────────────────────────────────────────────

  @Test
  void nestedToolbarActionRunsOnTheHydratedNestedInstance() {
    Address.lastAction = null;
    var state = new HashMap<String, Object>();
    state.put("address", Map.of("street", "Third st", "city", "Sevilla"));
    run("nested-form-action-address-verify", state, null);
    assertThat(Address.lastAction).isEqualTo("verified:Sevilla");
  }

  @Test
  void nestedActionsAreAdvertisedOnSync() {
    var increment = mateu.sync("/nested");
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.actions())
        .extracting(io.mateu.dtos.ActionDto::id)
        .contains("nested-form-action-address-verify");
  }
}
