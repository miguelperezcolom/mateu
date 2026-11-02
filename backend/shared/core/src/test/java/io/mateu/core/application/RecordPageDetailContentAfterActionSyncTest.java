package io.mateu.core.application;

import static io.mateu.core.application.LayoutSyncTest.allMetadata;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.DetailContentSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A crud's record page whose record supplies its own content ({@link DetailContentSupplier}) — its
 * fields hidden, its inputs fluent form fields inside that content — and whose own {@code @Toolbar}
 * methods answer the record ({@code return this}, {@code List.of(this, Message)}): the page is
 * re-rendered IN PLACE as the view route draws it — the crud's header and toolbar (Back to list,
 * Edit) and the record's content — not replaced by a bare reflected form of the record (blank below
 * the header).
 */
class RecordPageDetailContentAfterActionSyncTest {

  public static class Note implements Identifiable, DetailContentSupplier {
    @Hidden public String id;
    @Hidden public String text;
    @Hidden public int days = 7;

    public Note() {}

    Note(String id, String text) {
      this.id = id;
      this.text = text;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return text;
    }

    @Override
    public Component detailContent(HttpRequest httpRequest) {
      return new Text("Custom content of " + text + " for " + days + " days");
    }

    @Toolbar
    public Object extend() {
      days = days + 1;
      return this;
    }

    @Toolbar
    public Object extendAndSay() {
      days = days + 1;
      return List.of(this, Message.success("extended"));
    }
  }

  @UI("/notes")
  @Title("Notes")
  public static class Notes extends AutoCrud<Note> {
    @Override
    public CrudStore<Note> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Note> findById(String id) {
          return Optional.of(new Note(id, "Note " + id));
        }

        @Override
        public String save(Note entity) {
          return entity.id;
        }

        @Override
        public List<Note> findAll() {
          return List.of(new Note("1", "Note 1"));
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  public record NoteRow(String id, String text) {}

  /** The ec-demo shape: a listing of rows that is only Navigable, its record page a Note. */
  @UI("/note-list")
  @Title("Note list")
  public static class NoteList implements Listing<NoteRow>, Navigable<Note, String> {
    @Override
    public ListingData<NoteRow> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new NoteRow("1", "Note 1")));
    }

    @Override
    public Note view(String id, HttpRequest httpRequest) {
      return new Note(id, "Note " + id);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Notes.class, NoteList.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** Where the record page lives: the crud mounted at /notes, or the navigable listing. */
  record Mount(String route, Class<?> type) {}

  static final Mount CRUD = new Mount("/notes", Notes.class);
  static final Mount LISTING = new Mount("/note-list", NoteList.class);

  private static UIIncrementDto open() {
    return open(CRUD);
  }

  private static UIIncrementDto open(Mount mount) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(mount.route() + "/1")
            .consumedRoute(mount.route())
            .serverSideType(mount.type().getName())
            .actionId("")
            .initiatorComponentId("nt_app")
            .build());
  }

  private static ServerSideComponentDto pageComponent(UIIncrementDto increment) {
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  /** A button of the record page: it bubbles to the crud with the page's values. */
  private static UIIncrementDto press(String actionId, Map<String, Object> typed) {
    return press(CRUD, actionId, typed);
  }

  @SuppressWarnings("unchecked")
  private static UIIncrementDto press(Mount mount, String actionId, Map<String, Object> typed) {
    var page = pageComponent(open(mount));
    var pageState = new LinkedHashMap<>((Map<String, Object>) page.initialData());
    pageState.putAll(typed);
    return mateu.run(
        RunActionRqDto.builder()
            .route(mount.route() + "/1")
            .consumedRoute(mount.route())
            .serverSideType(mount.type().getName())
            .actionId(actionId)
            .initiatorComponentId("nt_app")
            .componentState(Map.of("_route", "view", "_componentRoute", mount.route()))
            .parameters(Map.of("initiatorState", pageState))
            .build());
  }

  private static UIFragmentDto pageFragment(UIIncrementDto increment) {
    return increment.fragments().stream()
        .filter(f -> "nt_app_view".equals(f.targetComponentId()))
        .filter(f -> f.component() != null)
        .findFirst()
        .orElse(null);
  }

  private static List<String> texts(UIFragmentDto fragment) {
    var increment =
        new UIIncrementDto(
            List.of(),
            List.of(),
            List.of(fragment),
            List.of(),
            false,
            null,
            null,
            null,
            null,
            null);
    return allMetadata(increment, TextDto.class).stream().map(TextDto::text).toList();
  }

  private static PageDto page(UIFragmentDto fragment) {
    var increment =
        new UIIncrementDto(
            List.of(),
            List.of(),
            List.of(fragment),
            List.of(),
            false,
            null,
            null,
            null,
            null,
            null);
    return allMetadata(increment, PageDto.class).get(0);
  }

  @Test
  void theRecordsToolbarButtonsBubbleToTheCrud() {
    var page = pageComponent(open());
    assertThat(allMetadata(open(), PageDto.class).get(0).toolbar())
        .extracting(ButtonDto::actionId)
        .contains("action-on-view-extend", "action-on-view-extendAndSay", "cancel-view", "edit");
    assertThat(page.actions())
        .filteredOn(a -> a.id().equals("action-on-view-extend"))
        .singleElement()
        .extracting(ActionDto::bubble)
        .isEqualTo(true);
  }

  @Test
  void anActionAnsweringTheRecordReRendersTheRecordPageWithItsContent() {
    var increment = press("action-on-view-extend", Map.of());
    var fragment = pageFragment(increment);
    assertThat(fragment).as("the record page, re-rendered in place").isNotNull();
    var component = (ServerSideComponentDto) fragment.component();
    assertThat(component.id()).isEqualTo("nt_app_view");
    assertThat(texts(fragment)).contains("Custom content of Note 1 for 8 days");
    assertThat(page(fragment).toolbar())
        .extracting(ButtonDto::actionId)
        .contains("action-on-view-extend", "cancel-view", "edit");
    assertThat((Map<String, Object>) component.initialData())
        .containsEntry("days", 8)
        .containsEntry("_pageId", "nt_app_view")
        .containsEntry("_pageRoute", "/notes");
  }

  @Test
  void theRecordWithAMessageReRendersThePageAndShowsTheMessage() {
    var increment = press("action-on-view-extendAndSay", Map.of("days", 10));
    assertThat(texts(pageFragment(increment))).contains("Custom content of Note 1 for 11 days");
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("extended"));
  }

  @Test
  void aNavigableListingsRecordPageToo() {
    var increment = press(LISTING, "action-on-view-extendAndSay", Map.of());
    var fragment = pageFragment(increment);
    assertThat(fragment).as("the record page, re-rendered in place").isNotNull();
    assertThat(texts(fragment)).contains("Custom content of Note 1 for 8 days");
    assertThat(page(fragment).toolbar())
        .extracting(ButtonDto::actionId)
        .contains("action-on-view-extend", "cancel-view");
    assertThat(increment.messages()).anySatisfy(m -> assertThat(m.text()).isEqualTo("extended"));
  }
}
