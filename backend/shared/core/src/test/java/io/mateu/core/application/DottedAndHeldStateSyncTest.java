package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Two ways client state used to get past the field access rules (GA review round 2):
 *
 * <ul>
 *   <li>J2 — a DOTTED key ({@code pay.salary}): the writer followed it through the parent's getter,
 *       checking only the leaf, never the parent; on a crud save (built as the server) not even the
 *       leaf.
 *   <li>J3 — the beans a view HOLDS: a {@code final} or injected field received the client's map
 *       poured into the held object (every editable field set, the missing ones nulled) — a shared
 *       bean changed for every later request — and a getter exposed it to dotted keys.
 * </ul>
 */
class DottedAndHeldStateSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  // ── J2 ──────────────────────────────────────────────────────────────────────────────────

  public static class Pay {
    @ReadOnlyUnless(roles = "manager")
    public double salary = 100;

    @EyesOnly(roles = "manager")
    public String secretNote = "top";

    public String note = "n";

    public Pay() {}

    Pay(double salary, String secretNote, String note) {
      this.salary = salary;
      this.secretNote = secretNote;
      this.note = note;
    }
  }

  @UI("/dh-employee")
  public static class Employee {
    @Inline public Pay pay = new Pay();

    @ReadOnlyUnless(roles = "manager")
    public Pay locked = new Pay();

    @EyesOnly(roles = "manager")
    public Pay hidden = new Pay();

    // ordinary getters: the dotted spelling is written through them
    public Pay getPay() {
      return pay;
    }

    public Pay getLocked() {
      return locked;
    }

    public Pay getHidden() {
      return hidden;
    }

    @Action
    public Message save() {
      return new Message(
          "pay.salary="
              + pay.salary
              + " pay.secret="
              + pay.secretNote
              + " locked.note="
              + locked.note
              + " hidden.note="
              + hidden.note);
    }
  }

  public static class Staff implements Identifiable {
    public String id;
    public String name;
    @Inline public Pay pay = new Pay();

    @ReadOnlyUnless(roles = "manager")
    public Pay locked = new Pay();

    public Staff() {}

    public Pay getPay() {
      return pay;
    }

    public Pay getLocked() {
      return locked;
    }

    Staff(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Staff> STAFF = new ArrayList<>();

  @UI("/dh-staff")
  @Title("Staff")
  public static class StaffCrud extends AutoCrud<Staff> {
    @Override
    public CrudStore<Staff> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Staff> findById(String id) {
          return STAFF.stream().filter(s -> s.id.equals(id)).findFirst();
        }

        @Override
        public String save(Staff entity) {
          STAFF.removeIf(s -> s.id.equals(entity.id));
          STAFF.add(entity);
          return entity.id;
        }

        @Override
        public List<Staff> findAll() {
          return STAFF;
        }

        @Override
        public void deleteAllById(List<String> ids) {
          STAFF.removeIf(s -> ids.contains(s.id));
        }
      };
    }
  }

  // ── J3 ──────────────────────────────────────────────────────────────────────────────────

  public static class Store {
    public List<String> items = new ArrayList<>(List.of("a", "b"));
    public String apiUrl = "https://real";

    public String getApiUrl() {
      return apiUrl;
    }

    public List<String> getItems() {
      return items;
    }
  }

  public interface Endpoint {
    String getEndpoint();
  }

  public static class Service implements Endpoint {
    public String endpoint = "https://real-service";

    @Override
    public String getEndpoint() {
      return endpoint;
    }

    public void setEndpoint(String endpoint) {
      this.endpoint = endpoint;
    }
  }

  static final Store STORE = new Store();
  static final Service SERVICE = new Service();
  static final Service INJECTED = new Service();

  @UI("/dh-held")
  public static class HoldingView {
    private final Store store = STORE;
    private final Endpoint svc = SERVICE;
    @Inject Service injected = INJECTED;
    public String name = "x";

    public Endpoint getSvc() {
      return svc;
    }

    public Service getInjected() {
      return injected;
    }

    @Action
    public Message save() {
      return new Message("name=" + name);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Employee.class, StaffCrud.class, HoldingView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    STAFF.clear();
    var stored = new Staff("S-1", "Ada");
    stored.pay = new Pay(100, "top", "n");
    stored.locked = new Pay(100, "top", "n");
    STAFF.add(stored);
    STORE.apiUrl = "https://real";
    STORE.items = new ArrayList<>(List.of("a", "b"));
    SERVICE.endpoint = "https://real-service";
    INJECTED.endpoint = "https://real-service";
  }

  private static UIIncrementDto run(
      String route, String consumed, Class<?> type, String action, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(type.getName())
            .actionId(action)
            .initiatorComponentId("c1")
            .componentState(state)
            .parameters(Map.of())
            .build(),
        Map.of());
  }

  private static String text(UIIncrementDto increment) {
    return increment.messages().isEmpty() ? "" : increment.messages().get(0).text();
  }

  @Test
  void aDottedKeyDoesNotWritePastTheParentsRules() {
    var state = new LinkedHashMap<String, Object>();
    state.put("locked.note", "PWN4");
    state.put("hidden.note", "PWN5");
    state.put("pay.salary", 998);
    state.put("pay.secretNote", "pwned");
    assertThat(text(run("/dh-employee", "/dh-employee", Employee.class, "save", state)))
        .isEqualTo("pay.salary=100.0 pay.secret=top locked.note=n hidden.note=n");
  }

  @Test
  void aDottedKeyDoesNotWritePastTheNestedGuardsOnACrudSave() {
    var state = new LinkedHashMap<String, Object>();
    state.put("id", "S-1");
    state.put("name", "Ada 2");
    state.put("pay.salary", 998);
    state.put("pay.secretNote", "pwned");
    state.put("locked.salary", 997);
    state.put("locked.note", "pwned");
    run("/dh-staff/S-1/edit", "/dh-staff", StaffCrud.class, "save", state);
    var stored = STAFF.stream().filter(s -> s.id.equals("S-1")).findFirst().orElseThrow();
    assertThat(stored.name).isEqualTo("Ada 2");
    assertThat(stored.pay.salary).isEqualTo(100.0);
    assertThat(stored.pay.secretNote).isEqualTo("top");
    assertThat(stored.locked.salary).isEqualTo(100.0);
    assertThat(stored.locked.note).isEqualTo("n");
  }

  @Test
  void aBeanTheViewHoldsInAFinalFieldIsNeverWrittenFromClientState() {
    var state = new LinkedHashMap<String, Object>();
    state.put("name", "y");
    state.put("store", Map.of("apiUrl", "http://evil"));
    assertThat(text(run("/dh-held", "/dh-held", HoldingView.class, "save", state)))
        .isEqualTo("name=y");
    assertThat(STORE.apiUrl).isEqualTo("https://real");
    assertThat(STORE.items).containsExactly("a", "b");
  }

  @Test
  void aBeanReachedThroughAGetterIsNeverWrittenByADottedKey() {
    var state = new LinkedHashMap<String, Object>();
    state.put("svc.endpoint", "http://evil2");
    state.put("injected.endpoint", "http://evil3");
    state.put("injected", Map.of("endpoint", "http://evil4"));
    run("/dh-held", "/dh-held", HoldingView.class, "save", state);
    assertThat(SERVICE.endpoint).isEqualTo("https://real-service");
    assertThat(INJECTED.endpoint).isEqualTo("https://real-service");
  }

  @Test
  void theHeldDependenciesPropertiesAreNotSentInTheState() {
    var load = JSON.valueToTree(run("/dh-held", "/dh-held", HoldingView.class, "", Map.of()));
    assertThat(load.toString()).doesNotContain("real-service");
  }
}
