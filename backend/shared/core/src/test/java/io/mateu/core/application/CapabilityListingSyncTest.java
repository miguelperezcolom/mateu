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

  @UI("/bulk-books")
  public static class BulkBooks implements Listing<Book>, Deletable<String> {
    static volatile List<String> lastArchived;

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }

    @Override
    public void deleteAllById(List<String> selectedIds, HttpRequest httpRequest) {}

    @io.mateu.uidl.annotations.ListToolbarButton(rowsSelectedRequired = true)
    public void archive(List<Book> selection, HttpRequest httpRequest) {
      lastArchived = selection.stream().map(Book::id).toList();
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

  @UI("/sorted-books")
  public static class SortedBooks implements Listing<Book>, Navigable<Book, String> {
    static volatile io.mateu.uidl.data.Pageable lastPageable;

    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      lastPageable = request.pageable();
      return all();
    }

    @Override
    public Book view(String id, HttpRequest httpRequest) {
      return BOOKS.get(0);
    }
  }

  public record BookFilters(String title) {}

  @UI("/smart-books")
  public static class SmartBooks
      implements Listing<Book>,
          Searchable,
          io.mateu.uidl.interfaces.Filterable<BookFilters>,
          Navigable<Book, String> {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return all();
    }

    @Override
    public Book view(String id, HttpRequest httpRequest) {
      return BOOKS.stream().filter(book -> book.id().equals(id)).findFirst().orElseThrow();
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
            DeletableBooks.class,
            BulkBooks.class,
            SmartBooks.class,
            SortedBooks.class);
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

  /**
   * "Rows only — sorting and pagination come free": the sort reaches {@code
   * request.pageable().sort()}, but only if a header offers it. No reflected column ever said it
   * was sortable, so no listing (AutoCrud included) could be sorted from the grid.
   */
  @Test
  void aListingsDataColumnsSortFromTheirHeader() {
    var crudl = listingOf(load(PlainBooks.class, "/plain-books"));
    var columns = new ArrayList<io.mateu.dtos.GridColumnDto>();
    crudl
        .columns()
        .forEach(c -> FieldKindsSyncTest.walk(c, io.mateu.dtos.GridColumnDto.class, columns));
    assertThat(columns).extracting(io.mateu.dtos.GridColumnDto::id).contains("title", "pages");
    assertThat(columns).allMatch(io.mateu.dtos.GridColumnDto::sortable);
  }

  /**
   * A header click sends {@code {fieldId, direction}}. The crud path read only {@code field}, so
   * every sort a user asked a navigable listing (or an AutoCrud) for was dropped on the server.
   */
  @Test
  void theSortAHeaderClickSendsReachesTheRequest() {
    run(
        SortedBooks.class,
        "/sorted-books",
        "search",
        Map.of(
            "sort", List.of(Map.of("fieldId", "pages", "direction", "descending")),
            "page", 1,
            "size", 10),
        Map.of("crudId", "crud"));
    assertThat(SortedBooks.lastPageable.sort())
        .containsExactly(
            new io.mateu.uidl.data.Sort("pages", io.mateu.uidl.data.Direction.descending));
    assertThat(SortedBooks.lastPageable.page()).isEqualTo(1);
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
    // a record's generated toString is a field dump, never a title: the class names it instead
    assertThat(String.valueOf(detail)).doesNotContain("Book[id=");
  }

  /**
   * A deep link, a reload or a browser Forward to a record: the page is opened at its url, the
   * mediator answers, and the nested view loads with the state the mediator sent. That state is
   * where the record travels ({@code _route}) — and the bridge serialized only the LISTING, so it
   * never did: the nested view loaded the listing under the record's url.
   */
  @Test
  void aDeepLinkToARecordOfANavigableListingOpensTheRecord() {
    var opened =
        mateu.run(
            RunActionRqDto.builder()
                .route("/navigable-books/b2")
                .consumedRoute("_empty")
                .actionId("")
                .initiatorComponentId("_ux")
                .build());
    Map<String, Object> state = null;
    for (var fragment : opened.fragments()) {
      if (fragment.state() instanceof Map<?, ?> s && s.get("_route") != null) {
        state = (Map<String, Object>) s;
      }
    }
    assertThat(state).as("the record travels in the mediator's state").isNotNull();
    assertThat(state.get("_route")).isEqualTo("/b2");

    var nested =
        mateu.run(
            RunActionRqDto.builder()
                // what the nested view asks for: its component route + the record from the state
                .route("/navigable-books" + state.get("_route"))
                .consumedRoute("/navigable-books")
                .serverSideType(NavigableBooks.class.getName())
                .actionId("")
                .initiatorComponentId("cap_nested")
                .componentState(state)
                .build());
    assertThat(String.valueOf(nested)).contains("Rayuela");
    var listings = new ArrayList<CrudlDto>();
    nested
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), CrudlDto.class, listings));
    assertThat(listings).as("the record, not the listing").isEmpty();
  }

  /**
   * The detail page offers only what the listing declared, as the listing itself does: a Navigable
   * listing that is neither Editable nor Creatable showed Edit and Add another on its detail, and
   * both led to a route nothing serves.
   */
  @Test
  void theDetailOfAListingThatIsOnlyNavigableOffersNeitherEditNorNew() {
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
    assertThat(String.valueOf(detail))
        .contains("actionId=cancel-view")
        .doesNotContain("actionId=edit,", "actionId=new,");
  }

  // ── Searchable + Filterable + Navigable together ──────────────────────────

  @Test
  void aNavigableListingStillDeclaresItsSearchBoxAndFilters() {
    // Promoting a listing to the CRUD mediator (because it is Navigable) must NOT drop the search
    // box or the filter bar it also declares. Both travel from the same CapabilityCrud, whatever
    // interaction capabilities are added alongside them.
    var crudl = listingOf(load(SmartBooks.class, "/smart-books"));
    assertThat(crudl.searchable()).isTrue();
    assertThat(crudl.filters()).isNotEmpty();
    assertThat(crudl.filters().stream().map(io.mateu.dtos.FormFieldDto::fieldId)).contains("title");
    // and the interaction capability is still there
    assertThat(firstColumnActionId(crudl)).isEqualTo("view");
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

  /**
   * After a delete the listing has to show what is left. The response used to aim a RunAction
   * "search" at a listing id the server guessed ({@code ux_..._cs_list}), which no component in the
   * browser carries — the deleted rows stayed on screen until a reload. The listing now subscribes
   * to an event the delete emits.
   */
  @Test
  void aDeleteTellsTheListingToRefreshThroughAnEventItSubscribesTo() {
    var deleted =
        run(
            DeletableBooks.class,
            "/deletable-books",
            "delete",
            Map.of("crud_selected_items", List.of(Map.of("id", "b2"))),
            null);
    assertThat(deleted.commands())
        .anySatisfy(
            command -> {
              assertThat(command.type()).isEqualTo(io.mateu.dtos.UICommandTypeDto.DispatchEvent);
              assertThat(String.valueOf(command.data()))
                  .contains(
                      io.mateu.core.infra.declarative.orchestrators.crud.Crud
                          .LISTING_CHANGED_EVENT);
            });
    assertThat(String.valueOf(deleted)).doesNotContain("_cs_list");
    // the action answers several results at once: their list's toString is no window title
    assertThat(deleted.commands())
        .noneMatch(
            command ->
                command.type() == io.mateu.dtos.UICommandTypeDto.SetWindowTitle
                    && String.valueOf(command.data()).startsWith("["));

    var listing = load(DeletableBooks.class, "/deletable-books");
    var subscriptions = new ArrayList<io.mateu.dtos.OnCustomEventTriggerDto>();
    for (var fragment : listing.fragments()) {
      collectTriggers(fragment.component(), subscriptions);
    }
    assertThat(subscriptions)
        .anySatisfy(
            trigger -> {
              assertThat(trigger.eventName())
                  .isEqualTo(
                      io.mateu.core.infra.declarative.orchestrators.crud.Crud
                          .LISTING_CHANGED_EVENT);
              assertThat(trigger.actionId()).isEqualTo("search");
            });
  }

  private static void collectTriggers(
      Object component, List<io.mateu.dtos.OnCustomEventTriggerDto> found) {
    var servers = new ArrayList<io.mateu.dtos.ServerSideComponentDto>();
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      servers.add(server);
    }
    FieldKindsSyncTest.walk(component, io.mateu.dtos.ServerSideComponentDto.class, servers);
    for (var server : servers) {
      if (server.triggers() != null) {
        server.triggers().stream()
            .filter(io.mateu.dtos.OnCustomEventTriggerDto.class::isInstance)
            .map(io.mateu.dtos.OnCustomEventTriggerDto.class::cast)
            .forEach(found::add);
      }
    }
  }

  // ── @ListToolbarButton methods on the bridged listing (behaviourSource) ───

  @Test
  void bulkMethodsDeclaredOnTheBridgedListingBecomeToolbarButtonsAndAreInvoked() {
    var crudl = listingOf(load(BulkBooks.class, "/bulk-books"));
    assertThat(toolbarActionIds(crudl)).contains("action-on-row-archive");

    run(
        BulkBooks.class,
        "/bulk-books",
        "action-on-row-archive",
        Map.of(
            "crud_selected_items",
            List.of(Map.of("id", "b1", "title", "El Quijote", "pages", 863))),
        null);
    assertThat(BulkBooks.lastArchived).containsExactly("b1");
  }

  // ── loading ───────────────────────────────────────────────────────────────

  private List<String> onLoadActions(UIIncrementDto increment) {
    var found = new ArrayList<io.mateu.dtos.ServerSideComponentDto>();
    increment
        .fragments()
        .forEach(
            f ->
                FieldKindsSyncTest.walk(
                    f.component(), io.mateu.dtos.ServerSideComponentDto.class, found));
    if (increment.fragments().stream()
        .anyMatch(f -> f.component() instanceof io.mateu.dtos.ServerSideComponentDto)) {
      increment.fragments().stream()
          .map(f -> f.component())
          .filter(io.mateu.dtos.ServerSideComponentDto.class::isInstance)
          .map(io.mateu.dtos.ServerSideComponentDto.class::cast)
          .forEach(found::add);
    }
    return found.stream()
        .flatMap(
            c -> c.triggers() == null ? java.util.stream.Stream.empty() : c.triggers().stream())
        .filter(io.mateu.dtos.OnLoadTriggerDto.class::isInstance)
        .map(t -> ((io.mateu.dtos.OnLoadTriggerDto) t).actionId())
        .toList();
  }

  /**
   * A listing shows its rows when it opens, whatever capabilities it declares. It used to load only
   * once it declared an interaction capability — which is what promotes it to the CRUD mediator,
   * the one that carried the load trigger — so a read-only listing opened empty until the user
   * searched, with nothing saying why.
   */
  @Test
  void aListingLoadsItsRowsOnOpeningWithoutAnyInteractionCapability() {
    assertThat(onLoadActions(load(PlainBooks.class, "/plain-books"))).contains("search");
    assertThat(onLoadActions(load(SearchableBooks.class, "/searchable-books"))).contains("search");
    assertThat(onLoadActions(load(NavigableBooks.class, "/navigable-books"))).contains("search");
  }
}
