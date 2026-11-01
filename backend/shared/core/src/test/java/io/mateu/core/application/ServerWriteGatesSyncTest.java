package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.NoticeDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.NotCreatable;
import io.mateu.uidl.annotations.NotDeletable;
import io.mateu.uidl.annotations.NotEditable;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.data.CrudDisplay;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Server-side enforcement of what the UI only used to hide (Fable review A1, A3, A4, A5, A14, A17):
 * crafted requests to a crud's writes, an unmarked method named by a mere string literal, a {@code
 * nested-form-action-} naming no field, ids as JSON numbers, a version ahead of the stored one, and
 * the drawer error banner going through the error boundary.
 */
@SuppressWarnings("unchecked")
class ServerWriteGatesSyncTest {

  public static class Item implements Identifiable {
    String id;
    String name;
    @Version int version;

    public Item() {}

    Item(String id, String name, int version) {
      this.id = id;
      this.name = name;
      this.version = version;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Item> ITEMS = new ArrayList<>();

  static CrudStore<Item> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Item> findById(String id) {
        return ITEMS.stream().filter(r -> r.id.equals(id)).findFirst();
      }

      @Override
      public String save(Item entity) {
        if (entity.name != null && entity.name.contains("sql")) {
          throw new IllegalStateException("insert into item values ('secret')");
        }
        if (entity.name != null && entity.name.contains("polite")) {
          throw new UserFacingException("That name is taken");
        }
        ITEMS.removeIf(r -> r.id.equals(entity.id));
        ITEMS.add(entity);
        return entity.id;
      }

      @Override
      public List<Item> findAll() {
        return ITEMS;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        // a String-keyed store: an Integer id would match nothing (or fail on a cast)
        for (String id : ids) {
          ITEMS.removeIf(r -> r.id.equals(id));
        }
      }
    };
  }

  @UI("/gates-open")
  @Title("Open")
  public static class OpenCrud extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return ServerWriteGatesSyncTest.store();
    }
  }

  @UI("/gates-annotated")
  @Title("Annotated")
  @NotCreatable
  @NotEditable
  @NotDeletable
  public static class AnnotatedCrud extends OpenCrud {}

  @UI("/gates-readonly")
  @Title("Read only")
  @ReadOnly
  public static class ReadOnlyCrud extends OpenCrud {}

  @UI("/gates-display")
  @Title("Display")
  public static class DisplayCrud extends OpenCrud {
    @Override
    public CrudDisplay display() {
      return CrudDisplay.defaults().toBuilder().create(Toggle.disabled).delete(Toggle.off).build();
    }
  }

  @UI("/gates-drawer")
  @Title("Drawer")
  public static class DrawerCrud extends OpenCrud {
    @Override
    public boolean editInDrawer() {
      return true;
    }
  }

  /** A form whose unmarked method shares its name with a string literal of the class. */
  @UI("/gates-literal")
  public static class LiteralView {
    public String status = "idle";

    public Message purge() {
      CALLS.add("purge");
      return new Message("purge");
    }

    @Button
    public Object save() {
      CALLS.add("save");
      return this;
    }
  }

  /** A form with a required field and a validated button. */
  @UI("/gates-nested")
  public static class NestedView {
    @NotEmpty public String guest;

    @Button
    public Object save() {
      CALLS.add("save:" + guest);
      return this;
    }
  }

  static final List<String> CALLS = new ArrayList<>();

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            OpenCrud.class,
            AnnotatedCrud.class,
            ReadOnlyCrud.class,
            DisplayCrud.class,
            DrawerCrud.class,
            LiteralView.class,
            NestedView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    ITEMS.clear();
    ITEMS.add(new Item("1", "one", 1));
    ITEMS.add(new Item("2", "two", 1));
    CALLS.clear();
  }

  private UIIncrementDto run(
      String route, Class<?> type, String actionId, Map<String, Object> state) {
    return run(route, type, actionId, state, Map.of());
  }

  private UIIncrementDto run(
      String route,
      Class<?> type,
      String actionId,
      Map<String, Object> state,
      Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(type.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private static boolean refused(Runnable call) {
    try {
      call.run();
      return false;
    } catch (RuntimeException e) {
      return MateuForbiddenException.find(e) != null;
    }
  }

  private static Map<String, Object> selecting(Object id) {
    return Map.of("crud_selected_items", List.of(Map.of("id", id)));
  }

  private static String nameOf(String id) {
    return ITEMS.stream().filter(i -> i.id.equals(id)).map(i -> i.name).findFirst().orElse(null);
  }

  // ── A1: the crud write gates ───────────────────────────────────────────────────────────────

  @Test
  void anOpenCrudStillWrites() {
    run("/gates-open", OpenCrud.class, "delete", selecting("2"));
    assertThat(ITEMS).extracting(i -> i.id).containsExactly("1");
    run("/gates-open", OpenCrud.class, "create", Map.of("id", "9", "name", "nine"));
    assertThat(nameOf("9")).isEqualTo("nine");
  }

  @Test
  void annotationsRefuseCraftedWrites() {
    assertThat(
            refused(() -> run("/gates-annotated", AnnotatedCrud.class, "delete", selecting("2"))))
        .isTrue();
    assertThat(
            refused(
                () ->
                    run(
                        "/gates-annotated",
                        AnnotatedCrud.class,
                        "create",
                        Map.of("id", "9", "name", "nine"))))
        .isTrue();
    assertThat(
            refused(
                () ->
                    run(
                        "/gates-annotated",
                        AnnotatedCrud.class,
                        "save",
                        Map.of("id", "1", "name", "changed", "version", 1))))
        .isTrue();
    assertThat(ITEMS).hasSize(2);
    assertThat(nameOf("1")).isEqualTo("one");
  }

  @Test
  void aReadOnlyCrudRefusesEveryWrite() {
    assertThat(refused(() -> run("/gates-readonly", ReadOnlyCrud.class, "delete", selecting("2"))))
        .isTrue();
    assertThat(
            refused(
                () ->
                    run(
                        "/gates-readonly",
                        ReadOnlyCrud.class,
                        "save",
                        Map.of("id", "1", "name", "changed", "version", 1))))
        .isTrue();
    assertThat(refused(() -> run("/gates-readonly", ReadOnlyCrud.class, "new", Map.of()))).isTrue();
    assertThat(nameOf("1")).isEqualTo("one");
    assertThat(ITEMS).hasSize(2);
  }

  @Test
  void displayTogglesAreRefusedIfForced() {
    assertThat(refused(() -> run("/gates-display", DisplayCrud.class, "delete", selecting("2"))))
        .isTrue();
    assertThat(
            refused(
                () ->
                    run(
                        "/gates-display",
                        DisplayCrud.class,
                        "create",
                        Map.of("id", "9", "name", "nine"))))
        .isTrue();
    assertThat(ITEMS).hasSize(2);
  }

  // ── A14: ids as JSON gave them ─────────────────────────────────────────────────────────────

  @Test
  void aNumericSelectedIdReachesAStringKeyedStoreAsItsIdType() {
    run("/gates-open", OpenCrud.class, "delete", selecting(2));
    assertThat(ITEMS).extracting(i -> i.id).containsExactly("1");
  }

  // ── A17: a version ahead of the stored one ─────────────────────────────────────────────────

  @Test
  void aVersionAheadOfTheStoredOneIsNotAdopted() {
    run("/gates-open", OpenCrud.class, "save", Map.of("id", "1", "name", "edited", "version", 999));
    var saved = ITEMS.stream().filter(i -> i.id.equals("1")).findFirst().orElseThrow();
    assertThat(saved.name).isEqualTo("edited");
    // saved from the STORED version (1), bumped once — not from the client's 999
    assertThat(saved.version).isEqualTo(2);
  }

  // ── A3: the drawer error banner goes through the error boundary ────────────────────────────

  @Test
  void anUnexpectedDrawerSaveFailureShowsTheGenericTextNotTheRawMessage() {
    var increment =
        run(
            "/gates-drawer",
            DrawerCrud.class,
            "save",
            Map.of("id", "1", "name", "sql", "version", 1));
    var notice = WireWalk.first(WireWalk.first(increment, DrawerDto.class), NoticeDto.class);
    assertThat(notice).isNotNull();
    assertThat(notice.text()).startsWith("An unexpected error occurred. Reference: ");
    assertThat(notice.text()).doesNotContain("insert into");
  }

  @Test
  void aUserFacingDrawerSaveFailureIsShownAsWritten() {
    var increment =
        run(
            "/gates-drawer",
            DrawerCrud.class,
            "save",
            Map.of("id", "1", "name", "polite", "version", 1));
    var notice = WireWalk.first(WireWalk.first(increment, DrawerDto.class), NoticeDto.class);
    assertThat(notice.text()).isEqualTo("That name is taken");
  }

  // ── A4: a string literal no longer advertises a method ─────────────────────────────────────

  @Test
  void anUnmarkedMethodNamedOnlyByALiteralIsRefused() {
    assertThat(refused(() -> run("/gates-literal", LiteralView.class, "purge", Map.of()))).isTrue();
    assertThat(CALLS).isEmpty();
  }

  // ── A5: nested-form-action naming no field ─────────────────────────────────────────────────

  @Test
  void aPrefixedIdNamingNoFieldIsRefusedAndTheValidationIsNotSkipped() {
    assertThat(
            refused(
                () ->
                    run(
                        "/gates-nested",
                        NestedView.class,
                        "nested-form-action-zzz-save",
                        Map.of("guest", ""))))
        .isTrue();
    assertThat(CALLS).isEmpty();
  }
}
