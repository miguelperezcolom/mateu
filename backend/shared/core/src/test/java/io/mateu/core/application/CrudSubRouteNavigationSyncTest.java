package io.mateu.core.application;

import static io.mateu.core.application.FieldKindsSyncTest.collect;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.CrudAuthoredSubRouteSyncTest.Student;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.NoCrudNavigation;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A page that overrides a CRUD's sub-screen through an AUTHORED route gets the CRUD's standard
 * navigation without writing it: "Back to list" and "Edit" on the record page, "Cancel" on the
 * editor and the creation page — labelled by the CRUD's own hooks, with the CRUD's action ids, and
 * navigating where the built-in screens' would. A page's own button or method with that id wins,
 * {@code @NoCrudNavigation} turns it off, and a read-only CRUD offers no Edit. A tree page (an
 * {@code ItemOverview}) also shows its own {@code @Toolbar} methods, which it never did.
 */
class CrudSubRouteNavigationSyncTest {

  static final List<Student> STUDENTS = List.of(new Student("s1", "Ada"));

  public static class Students extends AutoCrud<Student> {
    @Override
    public CrudStore<Student> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Student> findById(String id) {
          return STUDENTS.stream().filter(s -> s.id.equals(id)).findFirst();
        }

        @Override
        public String save(Student entity) {
          return entity.id;
        }

        @Override
        public List<Student> findAll() {
          return STUDENTS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }

    @Override
    public String backToListLabel() {
      return "Volver al listado";
    }

    @Override
    public String editLabel() {
      return "Editar";
    }

    @Override
    public String cancelLabel() {
      return "Cancelar";
    }
  }

  public static class ReadOnlyStudents extends Students {
    @Override
    public boolean readOnly() {
      return true;
    }
  }

  /** The authored record page: a tree page, with a toolbar method of its own. */
  public static class StudentPage extends ItemOverview {
    public String id;
    Markdown body = new Markdown("the authored student page", null, null);

    @Toolbar
    Message ping() {
      return Message.success("notified " + id);
    }
  }

  public static class ReadOnlyStudentPage extends ItemOverview {
    public String id;
    Markdown body = new Markdown("read only", null, null);
  }

  /** Fully custom: no injected navigation. */
  @NoCrudNavigation
  public static class CustomStudentPage extends ItemOverview {
    public String id;
    Markdown body = new Markdown("custom", null, null);
  }

  /** Declares its own "edit": the page's wins. */
  public static class OwnEditStudentPage extends ItemOverview {
    public String id;
    Markdown body = new Markdown("own edit", null, null);

    @Toolbar
    Message edit() {
      return Message.success("my own edit");
    }
  }

  public static class StudentEditor {
    public String id;
    public String name = "authored editor";
  }

  public static class StudentCreator {
    public String name = "authored creator";
  }

  @UI("")
  @Title("School")
  public static class School {
    @Menu Students students;
    @Menu ReadOnlyStudents readOnly;
    @Menu Students custom;
    @Menu Students own;
  }

  /** A crud reached through a menu GROUP of an app mounted under a path. */
  public static class Office {
    @Menu Students pupils;
  }

  @UI("/academy")
  @Title("Academy")
  public static class Academy {
    @Menu Office office;
  }

  public static class AuthoredRoutes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.of("students/new", StudentCreator.class.getName()),
          RouteEntry.of("students/:id", StudentPage.class.getName()),
          RouteEntry.of("students/:id/edit", StudentEditor.class.getName()),
          RouteEntry.of("read-only/:id", ReadOnlyStudentPage.class.getName()),
          RouteEntry.of("custom/:id", CustomStudentPage.class.getName()),
          RouteEntry.of("own/:id", OwnEditStudentPage.class.getName()),
          RouteEntry.of("academy/office/pupils/:id", ReadOnlyStudentPage.class.getName()));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new AuthoredRoutes()), School.class, Academy.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto load(String route) {
    return run(route, null, "", Map.of());
  }

  private static UIIncrementDto run(
      String route, Class<?> type, String actionId, Map<String, Object> state) {
    return run(route, "/", type, actionId, state);
  }

  private static UIIncrementDto run(
      String route, String consumed, Class<?> type, String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(type == null ? null : type.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(Map.of())
            .build());
  }

  private static PageDto page(UIIncrementDto increment) {
    var pages = collect(increment.fragments().get(0).component(), PageDto.class);
    assertThat(pages).isNotEmpty();
    return pages.get(0);
  }

  private static List<String> ids(List<ButtonDto> buttons) {
    return buttons == null ? List.of() : buttons.stream().map(ButtonDto::actionId).toList();
  }

  private static List<String> labels(List<ButtonDto> buttons) {
    return buttons == null ? List.of() : buttons.stream().map(ButtonDto::label).toList();
  }

  private static String navigatedTo(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.NavigateTo)
        .map(c -> String.valueOf(c.data()))
        .findFirst()
        .orElse(null);
  }

  @Test
  void theRecordPageGetsBackToListAndEditLabelledByTheCrud() {
    var page = page(load("/students/s1"));
    assertThat(ids(page.toolbar())).contains("ping", "cancel-view", "edit");
    assertThat(labels(page.toolbar())).contains("Volver al listado", "Editar");
  }

  @Test
  void theInjectedActionsNavigateWhereTheBuiltInOnesWould() {
    var state = Map.<String, Object>of("id", "s1");
    assertThat(navigatedTo(run("/students/s1", StudentPage.class, "cancel-view", state)))
        .isEqualTo("/students");
    assertThat(navigatedTo(run("/students/s1", StudentPage.class, "edit", state)))
        .isEqualTo("/students/s1/edit");
    assertThat(navigatedTo(run("/students/s1/edit", StudentEditor.class, "cancel-edit", state)))
        .isEqualTo("/students/s1");
    assertThat(navigatedTo(run("/students/new", StudentCreator.class, "cancel-new", Map.of())))
        .isEqualTo("/students");
  }

  @Test
  void theEditorAndTheCreationPageGetCancel() {
    var editor = page(load("/students/s1/edit"));
    assertThat(ids(editor.buttons())).contains("cancel-edit");
    assertThat(labels(editor.buttons())).contains("Cancelar");
    var creator = page(load("/students/new"));
    assertThat(ids(creator.buttons())).contains("cancel-new");
  }

  @Test
  void aReadOnlyCrudOffersNoEdit() {
    var page = page(load("/read-only/s1"));
    assertThat(ids(page.toolbar())).contains("cancel-view").doesNotContain("edit");
  }

  @Test
  void aPageCanOptOut() {
    var increment = load("/custom/s1");
    var pages = collect(increment.fragments().get(0).component(), PageDto.class);
    assertThat(pages.stream().flatMap(p -> ids(p.toolbar()).stream()))
        .doesNotContain("cancel-view");
  }

  @Test
  void thePagesOwnButtonWins() {
    var page = page(load("/own/s1"));
    assertThat(ids(page.toolbar()).stream().filter("edit"::equals)).hasSize(1);
    var increment = run("/own/s1", OwnEditStudentPage.class, "edit", Map.of("id", "s1"));
    assertThat(navigatedTo(increment)).isNull();
    assertThat(increment.messages()).extracting(m -> m.text()).contains("my own edit");
  }

  @Test
  void aTreePagesOwnToolbarMethodRuns() {
    var increment = run("/students/s1", StudentPage.class, "ping", Map.of("id", "s1"));
    assertThat(increment.messages()).extracting(m -> m.text()).contains("notified s1");
  }

  @Test
  void aCrudInAMenuGroupOfAMountedAppIsFoundToo() {
    // a content load inside the academy app (what its shell asks for)
    var page = page(run("/academy/office/pupils/s1", "/academy", null, "", Map.of()));
    assertThat(ids(page.toolbar())).contains("cancel-view", "edit");
    assertThat(
            navigatedTo(
                run(
                    "/academy/office/pupils/s1",
                    ReadOnlyStudentPage.class,
                    "cancel-view",
                    Map.of("id", "s1"))))
        .isEqualTo("/academy/office/pupils");
  }
}
