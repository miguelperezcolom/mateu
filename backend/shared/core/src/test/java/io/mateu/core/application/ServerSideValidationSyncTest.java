package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Bean validation constraints are enforced by the SERVER too, not only by the browser: an action
 * the client is told to validate ({@code validationRequired} — any
 * {@code @Button}/{@code @Toolbar}, or {@code @Action(validationRequired = true)}) is refused when
 * the hydrated form breaks one. It used to run with whatever a tampered or non-validating client
 * sent. The check mirrors the client's — same fields, same messages — and the client's conditions
 * follow Bean Validation's semantics: 0 and false satisfy {@code @NotNull}, and an empty optional
 * number satisfies {@code @Min}.
 */
class ServerSideValidationSyncTest {

  @UI("/server-validation")
  public static class Booking {
    @NotEmpty String guest;

    @NotNull Integer adults;

    @Min(1)
    Integer optionalRooms;

    @Max(10)
    int nights = 1;

    @Pattern(regexp = "^[A-Z]{3}$")
    String code;

    @NotEmpty
    @Hidden("state.nights > 5")
    String relaxedWhenLong;

    @Button
    Message save() {
      return new Message("saved");
    }

    @Action(validationRequired = false)
    Message draft() {
      return new Message("drafted");
    }
  }

  public static class Member implements io.mateu.uidl.interfaces.Identifiable {
    @io.mateu.uidl.annotations.HiddenInCreate @NotEmpty String id;

    @NotEmpty String name;

    @Min(18)
    int age = 30;

    public Member() {}

    Member(String id, String name, int age) {
      this.id = id;
      this.name = name;
      this.age = age;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Member> MEMBERS = new ArrayList<>();

  @UI("/server-validation-members")
  public static class Members
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Member> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Member> store() {
      return new io.mateu.uidl.interfaces.CrudStore<>() {
        @Override
        public java.util.Optional<Member> findById(String id) {
          return MEMBERS.stream().filter(m -> m.id().equals(id)).findFirst();
        }

        @Override
        public String save(Member entity) {
          if (entity.id == null) {
            entity.id = "m" + (MEMBERS.size() + 1);
          }
          MEMBERS.removeIf(m -> m.id().equals(entity.id));
          MEMBERS.add(entity);
          return entity.id;
        }

        @Override
        public List<Member> findAll() {
          return MEMBERS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          MEMBERS.removeIf(m -> selectedIds.contains(m.id()));
        }
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Booking.class, Members.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/server-validation")
            .actionId(actionId)
            .serverSideType(Booking.class.getName())
            .componentState(state)
            .initiatorComponentId("app")
            .build());
  }

  private static MessageDto message(UIIncrementDto increment) {
    assertThat(increment.messages()).hasSize(1);
    return increment.messages().get(0);
  }

  private static Map<String, Object> valid() {
    var state = new HashMap<String, Object>();
    state.put("guest", "Ana");
    state.put("adults", 0);
    state.put("nights", 3);
    return state;
  }

  @Test
  void aValidFormRunsTheAction() {
    // adults = 0 satisfies @NotNull; optionalRooms and code empty satisfy @Min and @Pattern
    assertThat(message(run("save", valid())).text()).isEqualTo("saved");
  }

  @Test
  void aBrokenConstraintRefusesTheActionWithTheClientsMessages() {
    var state = valid();
    state.put("guest", "");
    state.put("adults", null);
    state.put("optionalRooms", 0);
    state.put("nights", 12);
    state.put("code", "abc");

    var message = message(run("save", state));

    assertThat(message.title()).isEqualTo("There are validation errors");
    assertThat(message.text())
        .contains("• Guest: Cannot be empty")
        .contains("• Adults: Cannot be empty")
        .contains("• Optional rooms: Must be at least 1")
        .contains("• Nights: Must be at most 10")
        .contains("• Code: Invalid format")
        .doesNotContain("Relaxed when long");
  }

  @Test
  void anActionThatDoesNotRequireValidationIsNotChecked() {
    var state = valid();
    state.put("guest", "");
    assertThat(message(run("draft", state)).text()).isEqualTo("drafted");
  }

  @Test
  void theClientConditionsFollowBeanValidationSemantics() {
    var increment = mateu.sync("/server-validation");
    var validations =
        ((io.mateu.dtos.ServerSideComponentDto) increment.fragments().get(0).component())
            .validations();
    var byField = new HashMap<String, List<String>>();
    validations.forEach(
        v -> byField.computeIfAbsent(v.fieldId(), k -> new ArrayList<>()).add(v.condition()));

    // @NotNull: a value — and 0 and false count as values
    assertThat(byField.get("adults"))
        .containsExactly(
            "state['adults'] != null && state['adults'] !== '' && (state['adults'].length ==="
                + " undefined || state['adults'].length > 0)");
    // @Min on an optional number: an empty value passes
    assertThat(byField.get("optionalRooms"))
        .containsExactly(
            "state['optionalRooms'] == null || state['optionalRooms'] === '' || state['optionalRooms'] >= 1");
  }

  private static UIIncrementDto persist(String route, String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/server-validation-members")
            .serverSideType(Members.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .build());
  }

  @Test
  void aCrudSaveBreakingAConstraintIsRefusedAndNothingIsStored() {
    MEMBERS.clear();
    MEMBERS.add(new Member("m1", "Ann", 30));

    var edit = new HashMap<String, Object>(Map.of("id", "m1", "name", "Ann", "age", 12));
    var refused = message(persist("/server-validation-members/m1/edit", "save", edit));
    assertThat(refused.title()).isEqualTo("There are validation errors");
    assertThat(refused.text()).contains("• Age: Must be at least 18");
    assertThat(MEMBERS).extracting(m -> m.age).containsExactly(30);

    // the creation form does not render the @HiddenInCreate id, so its @NotEmpty is not checked
    var create = new HashMap<String, Object>(Map.of("name", "", "age", 40));
    var refusedCreate = message(persist("/server-validation-members/new", "create", create));
    assertThat(refusedCreate.text()).contains("• Name: Cannot be empty").doesNotContain("Id");
    assertThat(MEMBERS).hasSize(1);

    create.put("name", "Bob");
    persist("/server-validation-members/new", "create", create);
    assertThat(MEMBERS).extracting(m -> m.name).containsExactly("Ann", "Bob");
  }
}
