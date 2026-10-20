package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A CRUD whose record page is overridden by an AUTHORED route ({@code <crud>/:id} in routes.yaml or
 * a {@link RouteEntrySupplier}) — the documented way to give a record its own screen. Opening a row
 * from the CRUD's list sends the crud's {@code view} action on the list route; Mateu moves the
 * request to the record's route first, which now resolves to the authored view model, and ran the
 * crud's {@code view} on THAT — which knows no such action: 403 "you are not allowed to do this".
 */
class CrudAuthoredSubRouteSyncTest {

  public static class Student implements Identifiable {
    public String id;
    public String name;

    public Student() {}

    public Student(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Student> STUDENTS = new ArrayList<>(List.of(new Student("s1", "Ada")));

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
  }

  /** The authored record page. */
  public static class StudentPage extends ItemOverview {
    public String id;
    Markdown body = new Markdown("the authored student page", null, null);
  }

  /** The authored editor and creation pages. */
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
  }

  public static class AuthoredStudentRoutes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.of("students/new", StudentCreator.class.getName()),
          RouteEntry.of("students/:id", StudentPage.class.getName()),
          RouteEntry.of("students/:id/edit", StudentEditor.class.getName()));
    }
  }

  static TestMateu mateu;
  static final ObjectMapper JSON = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new AuthoredStudentRoutes()), School.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** What the renderers send for a click on a row / a toolbar button of the crud. */
  private static UIIncrementDto crudAction(
      String actionId, String route, Map<String, Object> state, Map<String, Object> params) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/students")
            .serverSideType(Students.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(params)
            .build());
  }

  private static String json(UIIncrementDto increment) {
    return JSON.valueToTree(increment).toString();
  }

  private static String pushed(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.PushStateToHistory)
        .map(c -> String.valueOf(c.data()))
        .findFirst()
        .orElse(null);
  }

  private static ServerSideComponentDto rendered(UIIncrementDto increment) {
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  @Test
  void openingARowGoesToTheAuthoredRecordPage() {
    var increment =
        crudAction(
            "view", "/students", Map.of("idFieldForRow", "id"), Map.of("id", "s1", "name", "Ada"));
    assertThat(pushed(increment)).isEqualTo("/students/s1");
    assertThat(rendered(increment).serverSideType()).isEqualTo(StudentPage.class.getName());
    assertThat(increment.fragments().get(0).state()).isEqualTo(Map.of("id", "s1"));
    assertThat(json(increment)).contains("the authored student page");
  }

  @Test
  void editingGoesToTheAuthoredEditor() {
    var increment =
        crudAction("edit", "/students/s1", Map.of("idFieldForRow", "id", "id", "s1"), Map.of());
    assertThat(pushed(increment)).isEqualTo("/students/s1/edit");
    assertThat(rendered(increment).serverSideType()).isEqualTo(StudentEditor.class.getName());
    assertThat(String.valueOf(increment.fragments().get(0).state())).contains("id=s1");
  }

  @Test
  void creatingGoesToTheAuthoredCreator() {
    var increment = crudAction("new", "/students", Map.of("idFieldForRow", "id"), Map.of());
    assertThat(pushed(increment)).isEqualTo("/students/new");
    assertThat(rendered(increment).serverSideType()).isEqualTo(StudentCreator.class.getName());
  }
}
