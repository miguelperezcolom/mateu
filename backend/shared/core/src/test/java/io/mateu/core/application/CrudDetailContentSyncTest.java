package io.mateu.core.application;

import static io.mateu.core.application.LayoutSyncTest.allMetadata;
import static io.mateu.core.application.LayoutSyncTest.findComponentWithMetadata;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.core.infra.declarative.orchestrators.itemoverview.ItemOverview;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.PageView;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.DetailContentSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@link DetailContentSupplier}: an {@code AutoCrud<T>} whose record page shows an item overview
 * (key-info card + tabs) instead of the read-only form — the workshop case. Only the content
 * changes: the header (title, subtitle, badges) and the toolbar stay the crud's, the buttons drawn
 * by the custom content still reach the crud, and the editor and the creation form — the same class
 * — keep their regular forms.
 */
class CrudDetailContentSyncTest {

  static final List<String> CALLS = new ArrayList<>();

  public static class Student implements Identifiable, SubtitleSupplier, DetailContentSupplier {
    public String id;
    public String name;
    public String email;
    public Status status = new Status(StatusType.SUCCESS, "Active");

    public Student() {}

    public Student(String id, String name, String email) {
      this.id = id;
      this.name = name;
      this.email = email;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }

    @Override
    public String subtitle() {
      return "Course 2025-26";
    }

    @Override
    public Component detailContent(HttpRequest httpRequest) {
      // a record can keep the default read-only form (here: the one with no email)
      return email == null ? null : new StudentOverview(this);
    }
  }

  /** What the workshop's EstudianteOverview is: an item overview built from the record. */
  static class StudentOverview extends ItemOverview {

    Component keyInfo;

    @Panel(title = "Personal data")
    Component personal;

    @Panel(title = "Enrolment")
    Component enrolment;

    StudentOverview(Student student) {
      keyInfo =
          VerticalLayout.builder()
              .content(
                  List.of(
                      new Text("Email: " + student.email),
                      new Button("Promote", "action-on-view-promote")))
              .build();
      personal = new Text("Name: " + student.name);
      enrolment = new Text("Enrolled since 2024");
    }
  }

  static final List<Student> STUDENTS =
      List.of(
          new Student("1", "Ada Lovelace", "ada@example.com"),
          new Student("2", "Alan Turing", null));

  @UI("/students")
  @Title("Students")
  public static class StudentsCrud extends AutoCrud<Student> {

    @ViewToolbarButton
    public Message promote(Student student) {
      CALLS.add("promote:" + student.name);
      return Message.success("promoted " + student.name);
    }

    @Override
    public CrudStore<Student> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Student> findById(String id) {
          return STUDENTS.stream().filter(s -> s.id().equals(id)).findFirst();
        }

        @Override
        public String save(Student entity) {
          return entity.id();
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

  /** The same hook on an editable view's view mode. */
  @UI("/my-profile")
  public static class MyProfile extends AutoEditableView<Student> {
    @Override
    public Student load(HttpRequest httpRequest) {
      return STUDENTS.get(0);
    }

    @Override
    public void persist(Student entity, HttpRequest httpRequest) {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(StudentsCrud.class, MyProfile.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto open(String route) {
    return run(route, "", Map.of());
  }

  private static UIIncrementDto run(String route, String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("/students")
            .serverSideType(StudentsCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("st_app")
            .componentState(state)
            .build());
  }

  private static PageDto page(UIIncrementDto increment) {
    return allMetadata(increment, PageDto.class).get(0);
  }

  private static List<String> fieldIds(UIIncrementDto increment) {
    return allMetadata(increment, FormFieldDto.class).stream().map(FormFieldDto::fieldId).toList();
  }

  @Test
  void theRecordPageKeepsTheCrudsHeaderAndToolbar() {
    var page = page(open("/students/1"));
    assertThat(page.title()).isEqualTo("Ada Lovelace");
    assertThat(page.subtitle()).isEqualTo("Course 2025-26");
    assertThat(page.badges()).extracting(b -> b.text()).containsExactly("${state.status.message}");
    assertThat(page.toolbar())
        .extracting(ButtonDto::actionId)
        .contains("action-on-view-promote", "cancel-view", "edit");
  }

  @Test
  void theRecordPageContentIsTheOneTheRecordSupplies() {
    var increment = open("/students/1");
    // the overview's tabs, expanded in place inside the crud's own component
    assertThat(findComponentWithMetadata(increment, TabLayoutDto.class)).isNotNull();
    assertThat(allMetadata(increment, TextDto.class))
        .extracting(TextDto::text)
        .contains("Email: ada@example.com", "Name: Ada Lovelace");
    // and no read-only form beside it
    assertThat(fieldIds(increment)).doesNotContain("name", "email");
  }

  @Test
  void aButtonOfTheCustomContentReachesTheCrud() {
    CALLS.clear();
    var increment =
        run(
            "/students/1",
            "action-on-view-promote",
            Map.of("id", "1", "name", "Ada Lovelace", "email", "ada@example.com"));
    assertThat(CALLS).containsExactly("promote:Ada Lovelace");
    assertThat(increment.messages())
        .anySatisfy(m -> assertThat(m.text()).isEqualTo("promoted Ada Lovelace"));
  }

  @Test
  void aRecordThatSuppliesNothingKeepsTheReadOnlyForm() {
    var increment = open("/students/2");
    assertThat(findComponentWithMetadata(increment, TabLayoutDto.class)).isNull();
    assertThat(fieldIds(increment)).contains("name");
  }

  @Test
  void theEditorAndTheCreationFormAreNotAffected() {
    for (var route : List.of("/students/1/edit", "/students/new")) {
      var increment = open(route);
      assertThat(findComponentWithMetadata(increment, TabLayoutDto.class)).as(route).isNull();
      assertThat(fieldIds(increment)).as(route).contains("name", "email");
    }
  }

  @Test
  void anEditableViewsViewModeHonoursItToo() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/my-profile")
                .consumedRoute("/my-profile")
                .serverSideType(MyProfile.class.getName())
                .actionId("")
                .initiatorComponentId("mp_app")
                .build());
    assertThat(findComponentWithMetadata(increment, TabLayoutDto.class)).isNotNull();
    assertThat(page(increment).toolbar()).extracting(ButtonDto::actionId).contains("edit");
  }

  @Test
  void aPageViewCanBeCopiedWithOneThingChanged() {
    var page =
        PageView.builder()
            .title("Ada")
            .subtitle("Course")
            .badgeItem(new Badge("Active"))
            .toolbarItem(new Button("Edit", "edit"))
            .contentItem(new Text("form"))
            .build();
    var copy = page.toBuilder().clearContent().contentItem(new Text("overview")).build();
    assertThat(copy.title()).isEqualTo("Ada");
    assertThat(copy.subtitle()).isEqualTo("Course");
    assertThat(copy.badges()).isEqualTo(page.badges());
    assertThat(copy.toolbar()).isEqualTo(page.toolbar());
    assertThat(copy.content()).containsExactly(new Text("overview"));
  }
}
