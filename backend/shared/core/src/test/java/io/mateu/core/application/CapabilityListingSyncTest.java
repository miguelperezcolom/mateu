package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Creatable;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.Editable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.Searchable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The capability model, combination by combination: a listing is a class implementing {@link
 * Listing} (rows only — sorting and pagination come free), and every further feature appears
 * because the class DECLARES it — {@link Searchable} the search box, {@link Navigable} clickable
 * rows + detail route, {@link Editable} the editor (in a drawer when not navigable), {@link
 * Creatable} the New button + create form, {@link Deletable} row selection + the Delete button.
 * Interaction capabilities promote the page to a CRUD mediator via {@code CapabilityCrud}, which
 * advertises the LISTING's class on the wire so round-trips re-bridge.
 */
class CapabilityListingSyncTest {

  public record Book(String id, String title, int pages) {}

  private static final List<Book> BOOKS =
      List.of(new Book("b1", "El Quijote", 863), new Book("b2", "Rayuela", 600));

  private static ListingData<Book> all() {
    return ListingData.from(BOOKS);
  }

  // ── fixtures: one class per combination ───────────────────────────────────

  @UI("/plain-books")
  @Title("Books")
  public static class PlainBooks implements Listing<Book> {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }
  }

  @UI("/searchable-books")
  public static class SearchableBooks implements Listing<Book>, Searchable {
    static volatile String lastSearchText;

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      lastSearchText = request.searchText();
      return all();
    }
  }

  @UI("/navigable-books")
  public static class NavigableBooks implements Listing<Book>, Navigable<Book, String> {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }

    @Override
    public Book view(String id, HttpRequest httpRequest) {
      return BOOKS.stream().filter(book -> book.id().equals(id)).findFirst().orElseThrow();
    }
  }

  @UI("/editable-books")
  public static class EditableBooks implements Listing<Book>, Editable<Book, String> {
    static volatile String lastSavedTitle;

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }

    @Override
    public Book edit(String id, HttpRequest httpRequest) {
      return BOOKS.stream().filter(book -> book.id().equals(id)).findFirst().orElseThrow();
    }

    @Override
    public String save(HttpRequest httpRequest) {
      var edited = httpRequest.getComponentState(Book.class);
      lastSavedTitle = edited.title();
      return edited.id();
    }
  }

  @UI("/creatable-books")
  public static class CreatableBooks implements Listing<Book>, Creatable<Book, String> {
    static volatile String lastCreatedTitle;

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }

    @Override
    public Book creationForm(HttpRequest httpRequest) {
      return new Book("", "", 0);
    }

    @Override
    public String create(HttpRequest httpRequest) {
      var created = httpRequest.getComponentState(Book.class);
      lastCreatedTitle = created.title();
      return "b3";
    }
  }

  @UI("/deletable-books")
  public static class DeletableBooks implements Listing<Book>, Deletable<String> {
    static volatile List<String> lastDeleted;

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }

    @Override
    public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {
      lastDeleted = selectedIds;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            PlainBooks.class,
            SearchableBooks.class,
            NavigableBooks.class,
            EditableBooks.class,
            CreatableBooks.class,
            DeletableBooks.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private UIIncrementDto load(Class<?> uiClass, String route) {
    return run(uiClass, route, "", Map.of(), null);
  }

  private UIIncrementDto run(
      Class<?> uiClass,
      String route,
      String actionId,
      Map<String, Object> state,
      Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route)
            .serverSideType(uiClass.getName())
            .actionId(actionId)
            .initiatorComponentId("cap_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  private CrudlDto listingOf(UIIncrementDto increment) {
    var found = new ArrayList<CrudlDto>();
    increment
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), CrudlDto.class, found));
    assertThat(found).isNotEmpty();
    return found.get(0);
  }

  private String firstColumnActionId(CrudlDto crudl) {
    var first = crudl.columns().get(0);
    var found = new ArrayList<io.mateu.dtos.GridColumnDto>();
    FieldKindsSyncTest.walk(first, io.mateu.dtos.GridColumnDto.class, found);
    return found.isEmpty() ? null : found.get(0).actionId();
  }

  private List<String> toolbarActionIds(CrudlDto crudl) {
    return crudl.toolbar() == null
        ? List.of()
        : crudl.toolbar().stream()
            .map(item -> item instanceof io.mateu.dtos.ButtonDto button ? button.actionId() : "")
            .toList();
  }

  // ── rows only ─────────────────────────────────────────────────────────────

  @Test
  void aBareListingHasNoSearchBoxNoFiltersNoButtonsAndNoClickableRows() {
    var crudl = listingOf(load(PlainBooks.class, "/plain-books"));
    assertThat(crudl.searchable()).isFalse();
    assertThat(crudl.filters()).isEmpty();
    assertThat(toolbarActionIds(crudl)).doesNotContain("new", "delete");
    assertThat(crudl.rowsSelectionEnabled()).isFalse();
    assertThat(firstColumnActionId(crudl)).isNull();
  }

  // ── + Searchable ──────────────────────────────────────────────────────────

  @Test
  void searchableShowsTheSearchBoxAndTheTypedTextReachesTheRequest() {
    var crudl = listingOf(load(SearchableBooks.class, "/searchable-books"));
    assertThat(crudl.searchable()).isTrue();

    run(
        SearchableBooks.class,
        "/searchable-books",
        "search",
        Map.of("searchText", "quijote"),
        null);
    assertThat(SearchableBooks.lastSearchText).isEqualTo("quijote");
  }

  // ── + Navigable ───────────────────────────────────────────────────────────

  @Test
  void navigableMakesRowsClickableAndServesTheDetailRoute() {
    var crudl = listingOf(load(NavigableBooks.class, "/navigable-books"));
    assertThat(firstColumnActionId(crudl)).isEqualTo("view");
    // still no create/delete chrome — only what was declared
    assertThat(toolbarActionIds(crudl)).doesNotContain("new", "delete");

    var detail =
        mateu.run(
            RunActionRqDto.builder()
                .route("/navigable-books/b1")
                .consumedRoute("/navigable-books")
                .serverSideType(NavigableBooks.class.getName())
                .actionId("")
                .initiatorComponentId("cap_app")
                .componentState(Map.of())
                .build());
    assertThat(String.valueOf(detail)).contains("El Quijote");
  }

  // ── + Editable (sin Navigable) ────────────────────────────────────────────

  @Test
  void editableWithoutNavigableOpensTheEditorInADrawerAndSavePersists() {
    var crudl = listingOf(load(EditableBooks.class, "/editable-books"));
    // the editable-listing idiom: the first column opens the EDITOR (drawer), not a view page
    assertThat(firstColumnActionId(crudl)).isEqualTo("view");

    var editIncrement =
        run(EditableBooks.class, "/editable-books", "view", Map.of("id", "b1"), null);
    var drawers = new ArrayList<io.mateu.dtos.DrawerDto>();
    editIncrement
        .fragments()
        .forEach(
            f -> FieldKindsSyncTest.walk(f.component(), io.mateu.dtos.DrawerDto.class, drawers));
    assertThat(drawers).isNotEmpty();

    run(
        EditableBooks.class,
        "/editable-books",
        "save",
        Map.of("id", "b1", "title", "El Quijote (anotado)", "pages", 900),
        null);
    assertThat(EditableBooks.lastSavedTitle).isEqualTo("El Quijote (anotado)");
  }

  // ── + Creatable ───────────────────────────────────────────────────────────

  @Test
  void creatableAddsTheNewButtonAndCreatePersists() {
    var crudl = listingOf(load(CreatableBooks.class, "/creatable-books"));
    assertThat(toolbarActionIds(crudl)).contains("new");
    assertThat(toolbarActionIds(crudl)).doesNotContain("delete");

    run(
        CreatableBooks.class,
        "/creatable-books",
        "create",
        Map.of("title", "Nuevo libro", "pages", 100),
        null);
    assertThat(CreatableBooks.lastCreatedTitle).isEqualTo("Nuevo libro");
  }

  // ── + Deletable ───────────────────────────────────────────────────────────

  @Test
  void deletableEnablesSelectionAndTheDeleteButton() {
    var crudl = listingOf(load(DeletableBooks.class, "/deletable-books"));
    assertThat(crudl.rowsSelectionEnabled()).isTrue();
    assertThat(toolbarActionIds(crudl)).contains("delete");
    assertThat(toolbarActionIds(crudl)).doesNotContain("new");

    run(
        DeletableBooks.class,
        "/deletable-books",
        "delete",
        Map.of("crud_selected_items", List.of(Map.of("id", "b1"))),
        null);
    assertThat(DeletableBooks.lastDeleted).containsExactly("b1");
  }
}
