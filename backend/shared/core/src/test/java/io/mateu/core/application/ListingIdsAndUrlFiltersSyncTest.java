package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ListingFilterDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.Searchable;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.IntStream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A listing shows what its URL asks for, and the menu says what that can be.
 *
 * <ul>
 *   <li>{@code ?ids=A,B} — the framework's reserved id-set filter — narrows ANY listing to exactly
 *       those rows, declared nowhere: applied by the store on an AutoCrud (rows past the first page
 *       included), handed to a hand-written search as {@code request.ids()}, and, when that search
 *       ignores it, applied to the page it returned.
 *   <li>The menu entry of a listing carries its descriptor: the declared filters by query param
 *       (enum values, ranges as {@code _from}/{@code _to}), the search param, the row id field and
 *       the ids param — what the chat assistant needs to open a listing already narrowed.
 * </ul>
 */
class ListingIdsAndUrlFiltersSyncTest {

  public enum Status {
    Pending,
    Confirmed,
    Cancelled
  }

  // ── an AutoCrud over 30 rows: the store applies ids, past page one too ─────────

  public static class Booking implements Identifiable {
    String id;
    String holder;
    Status status;
    LocalDate arrival;

    public Booking() {}

    Booking(String id, String holder, Status status, LocalDate arrival) {
      this.id = id;
      this.holder = holder;
      this.status = status;
      this.arrival = arrival;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Booking> BOOKINGS =
      IntStream.rangeClosed(1, 30)
          .mapToObj(
              i ->
                  new Booking(
                      "B" + i,
                      "Holder " + i,
                      i % 3 == 0 ? Status.Cancelled : Status.Confirmed,
                      LocalDate.of(2026, 11, 1).plusDays(i)))
          .toList();

  @UI("/bookings-auto")
  @Title("Bookings")
  public static class BookingsCrud extends AutoCrud<Booking> {
    @Override
    public CrudStore<Booking> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Booking> findById(String id) {
          return BOOKINGS.stream().filter(b -> b.id.equals(id)).findFirst();
        }

        @Override
        public String save(Booking entity) {
          return entity.id;
        }

        @Override
        public List<Booking> findAll() {
          return BOOKINGS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  // ── a hand-written listing that ignores ids: the framework narrows its page ────

  public record Row(String id, String name) {}

  public static class PlainFilters {
    @Label("Kind")
    Set<Status> status;

    DateRange created;
    String name;
  }

  @UI("/plain")
  @Title("Plain")
  public static class PlainListing implements Listing<Row>, Searchable, Filterable<PlainFilters> {
    static volatile SearchRequest last;

    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      last = request;
      return ListingData.from(
          List.of(new Row("r1", "one"), new Row("r2", "two"), new Row("r3", "three")));
    }
  }

  // ── a navigable listing (bridged into the crud engine) that ignores ids too ────

  public record Thing(String code, String name) {}

  @UI("/things")
  @Title("Things")
  public static class ThingsListing implements Listing<Thing>, Navigable<Thing, String> {
    @Override
    public ListingData<Thing> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(
          List.of(new Thing("t1", "one"), new Thing("t2", "two"), new Thing("t3", "three")));
    }

    @Override
    public Thing view(String id, HttpRequest httpRequest) {
      return new Thing(id, id);
    }
  }

  // ── the app whose menu describes them ─────────────────────────────────────────

  public static class CallCenter {
    @Menu BookingsCrud bookings;
    @Menu PlainListing plain;
    @Menu ThingsListing things;
  }

  @SuppressWarnings("unused")
  @UI("/app")
  @Title("App")
  public static class Root {
    @Menu CallCenter callCenter;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(Root.class, BookingsCrud.class, PlainListing.class, ThingsListing.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<?> search(String route, Class<?> type, Map<String, Object> state) {
    var fullState = new HashMap<String, Object>();
    fullState.put("page", 0);
    fullState.put("size", 10);
    fullState.put("searchText", "");
    fullState.putAll(state);
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute(route)
                .serverSideType(type.getName())
                .actionId("search")
                .initiatorComponentId("x")
                .componentState(fullState)
                .build());
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data
          && data.get("crud") instanceof ListingData<?> listing) {
        return listing.page().content();
      }
    }
    throw new AssertionError("no listing data in the search response");
  }

  private static List<String> idsOf(List<?> rows, String field) {
    return rows.stream()
        .map(
            row -> {
              if (row instanceof Map<?, ?> map) return String.valueOf(map.get(field));
              if (row instanceof Booking booking) return booking.id;
              if (row instanceof Row r) return r.id();
              if (row instanceof Thing t) return t.code();
              return String.valueOf(row);
            })
        .toList();
  }

  @Test
  void anAutoCrudShowsExactlyTheIdsAskedForEvenPastTheFirstPage() {
    var rows = search("/bookings-auto", BookingsCrud.class, Map.of("ids", "B2,B25,B30"));
    assertThat(idsOf(rows, "id")).containsExactlyInAnyOrder("B2", "B25", "B30");
  }

  @Test
  void theIdsCombineWithTheDeclaredFilters() {
    var rows =
        search(
            "/bookings-auto",
            BookingsCrud.class,
            Map.of("ids", List.of("B2", "B3", "B30"), "status", "Cancelled,Pending"));
    assertThat(idsOf(rows, "id")).containsExactlyInAnyOrder("B3", "B30");
  }

  @Test
  void withoutIdsTheListingIsUntouched() {
    var rows = search("/bookings-auto", BookingsCrud.class, Map.of("ids", " "));
    assertThat(rows).hasSize(10);
  }

  @Test
  void aHandWrittenSearchReceivesTheIdsAndIsNarrowedWhenItIgnoresThem() {
    var rows = search("/plain", PlainListing.class, Map.of("ids", "r3, r1,r3"));
    assertThat(PlainListing.last.ids()).containsExactly("r3", "r1");
    assertThat(idsOf(rows, "id")).containsExactlyInAnyOrder("r1", "r3");
  }

  @Test
  void aBridgedNavigableListingIsNarrowedOnItsRowIdField() {
    var rows = search("/things", ThingsListing.class, Map.of("ids", "t2"));
    assertThat(idsOf(rows, "code")).containsExactly("t2");
  }

  // ── the menu describes each listing's URL ─────────────────────────────────────

  private static AppDto app(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      var found = findApp(fragment.component());
      if (found != null) return found;
    }
    return null;
  }

  private static AppDto findApp(ComponentDto component) {
    if (component instanceof ClientSideComponentDto cs) {
      if (cs.metadata() instanceof AppDto app) return app;
      for (var child : cs.children()) {
        var found = findApp(child);
        if (found != null) return found;
      }
    }
    return null;
  }

  private static MenuOptionDto find(List<MenuOptionDto> menu, String label) {
    for (var option : menu) {
      if (label.equals(option.label())) return option;
      if (option.submenus() != null) {
        var found = find(option.submenus(), label);
        if (found != null) return found;
      }
    }
    return null;
  }

  private static MenuOptionDto entry(String label) {
    var app =
        app(
            mateu.run(
                RunActionRqDto.builder()
                    .route("/app")
                    .consumedRoute("_empty")
                    .actionId("")
                    .build()));
    assertThat(app).isNotNull();
    var option = find(app.menu(), label);
    assertThat(option).as(label).isNotNull();
    return option;
  }

  private static ListingFilterDto filter(MenuOptionDto option, String param) {
    return option.listing().filters().stream()
        .filter(f -> param.equals(f.param()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no filter " + param));
  }

  @Test
  void aCrudEntryDescribesItsFiltersAsTheUrlParamsTheListingReads() {
    var bookings = entry("Bookings");
    var listing = bookings.listing();
    assertThat(listing).isNotNull();
    assertThat(listing.idField()).isEqualTo("id");
    assertThat(listing.idsParam()).isEqualTo("ids");
    assertThat(listing.searchParam()).isEqualTo("searchText");
    // crud semantics: an enum is a multi-value, a date a from/to range
    var status = filter(bookings, "status");
    assertThat(status.type()).isEqualTo("enum");
    assertThat(status.multiple()).isTrue();
    assertThat(status.values()).containsExactly("Pending", "Confirmed", "Cancelled");
    var arrival = filter(bookings, "arrival");
    assertThat(arrival.type()).isEqualTo("dateRange");
    assertThat(arrival.fromParam()).isEqualTo("arrival_from");
    assertThat(arrival.toParam()).isEqualTo("arrival_to");
    assertThat(filter(bookings, "holder").type()).isEqualTo("text");
  }

  @Test
  void aPlainListingEntryDescribesItsTypedFiltersAndSearch() {
    var plain = entry("Plain");
    assertThat(plain.listing().searchParam()).isEqualTo("searchText");
    var status = filter(plain, "status");
    assertThat(status.label()).isEqualTo("Kind");
    assertThat(status.multiple()).isTrue();
    assertThat(filter(plain, "created").fromParam()).isEqualTo("created_from");
    assertThat(filter(plain, "name").type()).isEqualTo("text");
  }

  @Test
  void aNavigableListingWithoutFiltersStillOffersIdsOnItsRowIdField() {
    var things = entry("Things");
    assertThat(things.listing().idField()).isEqualTo("code");
    assertThat(things.listing().idsParam()).isEqualTo("ids");
    assertThat(things.listing().searchParam()).isNull();
    assertThat(things.listing().filters()).isEmpty();
  }

  @Test
  void aMenuGroupIsNotAListing() {
    assertThat(entry("Call center").listing()).isNull();
  }
}
