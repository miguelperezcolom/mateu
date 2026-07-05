package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Remaining tails: record/builder construction through the coercer, state serialization of
 * initialized collections and maps, crud row methods (action-on-row-), @AutoSave and OnValueChange
 * triggers, and app menus built from form fields and methods.
 */
class TailsSyncTest {

  // ── record + builder coercion (ConstructorResolver / BuilderInstantiator) ───

  @SuppressWarnings("unused")
  public enum Size {
    S,
    L
  }

  public record OrderLine(String sku, int qty, Size size, Amount price, List<String> notes) {}

  // ── state serialization breadth ─────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class Part {
    String code = "P-1";
    int units = 2;
  }

  @SuppressWarnings("unused")
  @UI("/machine")
  public static class MachineForm {
    String name = "Press";
    List<Part> parts = new ArrayList<>(List.of(new Part(), new Part()));
    Map<String, String> attributes = new LinkedHashMap<>(Map.of("color", "red"));

    static MachineForm seen;

    @io.mateu.uidl.annotations.Action
    void snap(HttpRequest httpRequest) {
      seen = this;
    }
  }

  // ── crud with a row method (action-on-row-) ─────────────────────────────────

  @SuppressWarnings("unused")
  public static class Ticket implements Identifiable {
    String id;
    String subject;
    boolean closed;

    public Ticket() {}

    public Ticket(String id, String subject) {
      this.id = id;
      this.subject = subject;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Ticket> TICKETS = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/tickets")
  @Title("Tickets")
  public static class TicketsCrud extends AutoCrud<Ticket> {
    static String closedId;

    @Override
    public CrudRepository<Ticket> repository() {
      return new CrudRepository<>() {
        @Override
        public Optional<Ticket> findById(String id) {
          return TICKETS.stream().filter(ticket -> ticket.id().equals(id)).findFirst();
        }

        @Override
        public String save(Ticket entity) {
          TICKETS.add(entity);
          return entity.id();
        }

        @Override
        public List<Ticket> findAll() {
          return TICKETS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          TICKETS.removeIf(ticket -> selectedIds.contains(ticket.id()));
        }
      };
    }

    Object close(Ticket row, HttpRequest httpRequest) {
      closedId = row.id();
      return null;
    }
  }

  // ── autosave + value-change triggers ────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/draft")
  @AutoSave(debounceMillis = 700)
  @Trigger(type = TriggerType.OnValueChange, actionId = "recalc", propertyName = "amount")
  public static class DraftForm {
    double amount;

    @io.mateu.uidl.annotations.Action
    void save(HttpRequest httpRequest) {}

    @io.mateu.uidl.annotations.Action
    void recalc(HttpRequest httpRequest) {}
  }

  // ── app whose menu points at fields and methods ─────────────────────────────

  @SuppressWarnings("unused")
  public static class SettingsPage {
    String theme = "dark";
  }

  @SuppressWarnings("unused")
  @UI("/console")
  @Title("Console")
  public static class ConsoleApp {
    @Menu SettingsPage settings = new SettingsPage();

    static boolean pinged;

    @io.mateu.uidl.annotations.Action
    void ping(HttpRequest httpRequest) {
      pinged = true;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(MachineForm.class, TicketsCrud.class, DraftForm.class, ConsoleApp.class);
    TICKETS.clear();
    TICKETS.add(new Ticket("t1", "Broken"));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── record/builder coercion ─────────────────────────────────────────────────

  @Test
  void recordsBuildThroughTheConstructorWithFullCoercion() {
    var line =
        MateuInstanceFactory.newInstance(
            OrderLine.class,
            Map.of(
                "sku", "AB-1",
                "qty", "5",
                "size", "L",
                "price", Map.of("currency", "EUR", "value", 9.5, "locale", "es-ES"),
                "notes", List.of("urgent", "fragile")),
            null);
    assertThat(line.sku()).isEqualTo("AB-1");
    assertThat(line.qty()).isEqualTo(5);
    assertThat(line.size()).isEqualTo(Size.L);
    assertThat(line.price().value()).isEqualTo(9.5);
    assertThat(line.notes()).containsExactly("urgent", "fragile");
  }

  @Test
  void recordsTolerateMissingComponents() {
    var line = MateuInstanceFactory.newInstance(OrderLine.class, Map.of("sku", "X"), null);
    assertThat(line.sku()).isEqualTo("X");
    assertThat(line.qty()).isZero();
    assertThat(line.size()).isNull();
  }

  // ── state serialization of collections and maps ─────────────────────────────

  @Test
  void initializedNestedListsSerializeAsListsOfMaps() {
    var increment = mateu.sync("/machine");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state.get("parts")).isInstanceOf(List.class);
    @SuppressWarnings("unchecked")
    var parts = (List<Map<String, Object>>) state.get("parts");
    assertThat(parts).hasSize(2);
    assertThat(parts.get(0)).containsEntry("code", "P-1").containsEntry("units", 2);
  }

  @Test
  void mapFieldsRoundTrip() {
    MachineForm.seen = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/machine")
            .actionId("snap")
            .serverSideType(MachineForm.class.getName())
            .componentState(Map.of("attributes", Map.of("color", "blue", "size", "XL")))
            .initiatorComponentId("mf_app")
            .build());
    assertThat(MachineForm.seen.attributes)
        .containsEntry("color", "blue")
        .containsEntry("size", "XL");
  }

  // ── crud row methods ────────────────────────────────────────────────────────

  @Test
  void rowMethodsRunWithTheClickedRow() {
    TicketsCrud.closedId = null;
    mateu.run(
        RunActionRqDto.builder()
            .route("/tickets")
            .consumedRoute("/tickets")
            .actionId("action-on-row-close")
            .serverSideType(TicketsCrud.class.getName())
            .componentState(Map.of())
            .parameters(Map.of("_clickedRow", Map.of("id", "t1", "subject", "Broken")))
            .initiatorComponentId("tk_app")
            .build());
    assertThat(TicketsCrud.closedId).isEqualTo("t1");
  }

  // ── autosave + value-change triggers ────────────────────────────────────────

  @Test
  void autoSaveAndValueChangeTriggersTravelOnTheWire() {
    var increment = mateu.sync("/draft");
    var component = (io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.AutoSaveTriggerDto.class);
              var autoSave = (io.mateu.dtos.AutoSaveTriggerDto) trigger;
              assertThat(autoSave.debounceMillis()).isEqualTo(700);
            });
    assertThat(component.triggers())
        .anySatisfy(
            trigger -> {
              assertThat(trigger).isInstanceOf(io.mateu.dtos.OnValueChangeTriggerDto.class);
              var change = (io.mateu.dtos.OnValueChangeTriggerDto) trigger;
              assertThat(change.actionId()).isEqualTo("recalc");
              assertThat(change.propertyName()).isEqualTo("amount");
            });
  }

  // ── app field/method menu links ─────────────────────────────────────────────

  @Test
  void appSyncListsTheMenuOptions() {
    var increment = mateu.sync("/console");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.menu()).extracting(io.mateu.dtos.MenuOptionDto::label).contains("Settings");
  }

  @Test
  void fieldMenuOptionsRenderTheFieldPage() {
    var increment = mateu.sync("/console/settings");
    assertThat(increment.fragments()).isNotEmpty();
  }
}
