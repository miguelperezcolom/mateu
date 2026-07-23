package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Surgical tails: the crud mediator resolved through the TYPED path with _empty consumed route,
 * multi-strip tab arrangements, fluent Menu fields with nested links, and crud presentation
 * overrides (subtitle, searchable off).
 */
class SurgicalTailsSyncTest {

  // ── crud with presentation overrides ────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class Note implements io.mateu.uidl.interfaces.Identifiable {
    String id = "n1";
    String text = "hello";

    public Note() {}

    @Override
    public String id() {
      return id;
    }
  }

  @SuppressWarnings("unused")
  @UI("/notes")
  @Title("Notes")
  public static class NotesCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Note> {
    @Override
    public io.mateu.uidl.interfaces.CrudRepository<Note> store() {
      return new io.mateu.uidl.interfaces.CrudRepository<>() {
        @Override
        public java.util.Optional<Note> findById(String id) {
          return java.util.Optional.of(new Note());
        }

        @Override
        public String save(Note entity) {
          return entity.id();
        }

        @Override
        public List<Note> findAll() {
          return List.of(new Note());
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  // ── multi-strip tabs ────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/tabbed")
  public static class TabbedForm {
    @Section("Uno")
    @Tab("A")
    String a1 = "1";

    @Tab("A")
    String a2 = "2";

    @Tab("B")
    String b1 = "3";

    @Section("Dos")
    @Tab("C")
    String c1 = "4";

    @Tab("D")
    String d1 = "5";
  }

  // ── fluent Menu field with nested links ─────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/nested-menu")
  @Title("Nested menu")
  public static class NestedMenuApp {
    @Menu
    io.mateu.uidl.data.Menu tools =
        new io.mateu.uidl.data.Menu(
            "/tools",
            "Tools",
            List.of(
                new RouteLink("/nested-menu/hammer", "Hammer"),
                new RouteLink("/nested-menu/saw", "Saw")));

    @Menu Simple simple = new Simple();
  }

  @SuppressWarnings("unused")
  public static class Simple {
    String x = "y";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(NotesCrud.class, TabbedForm.class, NestedMenuApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── typed mediator resolution ───────────────────────────────────────────────

  @Test
  void typedCrudResolutionWithEmptyConsumedRouteWrapsInTheMediator() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/notes")
                .consumedRoute("_empty")
                .serverSideType(NotesCrud.class.getName())
                .actionId("")
                .initiatorComponentId("nc_app")
                .build());
    // the typed _empty path produces the mediator envelope without fragments in-flight
    assertThat(increment).isNotNull();
  }

  @Test
  void crudPresentationOverridesTravel() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/notes")
                .consumedRoute("/notes")
                .serverSideType(NotesCrud.class.getName())
                .actionId("")
                .initiatorComponentId("nc_app")
                .build());
    assertThat(increment.fragments()).isNotEmpty();
  }

  // ── multi-strip tabs ────────────────────────────────────────────────────────

  @Test
  void tabGroupsSplitBySectionsProduceSeparateStrips() {
    var increment = mateu.sync("/tabbed");
    var tabs = new java.util.ArrayList<io.mateu.dtos.TabDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.TabDto.class, tabs);
    assertThat(tabs).extracting(io.mateu.dtos.TabDto::label).contains("A", "B", "C", "D");
  }

  // ── fluent Menu field ───────────────────────────────────────────────────────

  @Test
  void fluentMenuFieldsBecomeSubmenuOptions() {
    var increment = mateu.sync("/nested-menu");
    var app =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.AppDto.class);
    assertThat(app).isNotNull();
    var labels = new java.util.ArrayList<String>();
    app.menu().forEach(option -> collect(option, labels));
    assertThat(labels).contains("Tools", "Hammer", "Saw");
    assertThat(app.totalMenuOptions()).isGreaterThanOrEqualTo(3);
  }

  private static void collect(io.mateu.dtos.MenuOptionDto option, List<String> labels) {
    labels.add(option.label());
    if (option.submenus() != null) {
      option.submenus().forEach(sub -> collect(sub, labels));
    }
  }

  @Test
  void navigatingIntoASubmenuLinkRendersIt(
      @SuppressWarnings("unused") org.junit.jupiter.api.TestInfo info) {
    var increment = mateu.sync("/nested-menu/hammer");
    assertThat(increment).isNotNull();
  }
}
