package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * TYPED filter fields on declarative listings: a custom Filters class can declare {@link
 * DateRange}, {@link NumberRange} and {@code Set<SomeEnum>} fields — they render as range/multi
 * widgets on the smart search bar (stereotypes dateRange/numberRange/multiSelect, options from the
 * enum) and on search the flat {@code <field>_from}/{@code <field>_to} keys and value lists are
 * assembled back into the typed instances the developer's {@code search(...)} receives.
 */
class TypedFiltersSyncTest {

  @SuppressWarnings("unused")
  public enum Channel {
    WEB,
    PHONE,
    AGENCY
  }

  public record BookingRow(String id, String guest, LocalDate created, double total) {}

  @SuppressWarnings("unused")
  public static class BookingFilters {
    String guest;
    DateRange created;
    NumberRange total;
    Set<Channel> channels;
  }

  private static final List<BookingRow> BOOKINGS =
      List.of(
          new BookingRow("b1", "Smith", LocalDate.of(2026, 1, 10), 100),
          new BookingRow("b2", "Jones", LocalDate.of(2026, 2, 10), 250),
          new BookingRow("b3", "Brown", LocalDate.of(2026, 3, 10), 400));

  @SuppressWarnings("unused")
  @UI("/bookings")
  @Title("Bookings")
  public static class BookingSearch extends Listing<BookingFilters, BookingRow> {

    static volatile BookingFilters lastFilters;

    @Override
    public ListingData<BookingRow> search(
        String searchText, BookingFilters filters, Pageable pageable, HttpRequest httpRequest) {
      lastFilters = filters;
      var rows =
          BOOKINGS.stream()
              .filter(row -> filters.created == null || filters.created.contains(row.created()))
              .filter(row -> filters.total == null || filters.total.contains(row.total()))
              .toList();
      return ListingData.from(rows);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BookingSearch.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── metadata: the typed fields become range/multi filters ─────────────────────

  private static io.mateu.dtos.CrudlDto listing() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/bookings")
                .consumedRoute("/bookings")
                .serverSideType(BookingSearch.class.getName())
                .actionId("")
                .initiatorComponentId("bk_app")
                .build());
    var crudl = new java.util.ArrayList<io.mateu.dtos.CrudlDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.CrudlDto.class, crudl);
    assertThat(crudl).isNotEmpty();
    return crudl.get(0);
  }

  private static io.mateu.dtos.FormFieldDto filterOf(String fieldId) {
    return listing().filters().stream()
        .filter(field -> fieldId.equals(field.fieldId()))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void dateRangeFieldBecomesADateRangeFilter() {
    assertThat(filterOf("created").stereotype()).isEqualTo("dateRange");
  }

  @Test
  void numberRangeFieldBecomesANumberRangeFilter() {
    assertThat(filterOf("total").stereotype()).isEqualTo("numberRange");
  }

  @Test
  void enumSetFieldBecomesAMultiSelectFilterWithTheEnumOptions() {
    var channels = filterOf("channels");
    assertThat(channels.stereotype()).isEqualTo("multiSelect");
    assertThat(channels.options())
        .extracting(io.mateu.dtos.OptionDto::value)
        .containsExactly("WEB", "PHONE", "AGENCY");
  }

  @Test
  void plainFieldsKeepTheirSingleValueWidget() {
    assertThat(filterOf("guest").stereotype()).isNotIn("dateRange", "numberRange", "multiSelect");
  }

  // ── hydration: the flat state keys assemble into the typed instances ──────────

  private List<?> search(java.util.Map<String, Object> state) {
    var fullState = new java.util.HashMap<String, Object>();
    fullState.put("page", 0);
    fullState.put("size", 10);
    fullState.put("searchText", "");
    fullState.putAll(state);
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/bookings")
                .consumedRoute("/bookings")
                .serverSideType(BookingSearch.class.getName())
                .actionId("search")
                .initiatorComponentId("bk_app")
                .componentState(fullState)
                .build());
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof java.util.Map<?, ?> data
          && data.get("crud") instanceof ListingData<?> listing) {
        return listing.page().content();
      }
    }
    throw new AssertionError("no listing data in the search response");
  }

  @Test
  void dateRangeKeysAssembleIntoATypedDateRange() {
    var rows = search(java.util.Map.of("created_from", "2026-01-15", "created_to", "2026-02-20"));
    assertThat(BookingSearch.lastFilters.created)
        .isEqualTo(new DateRange(LocalDate.of(2026, 1, 15), LocalDate.of(2026, 2, 20)));
    assertThat(rows).hasSize(1);
  }

  @Test
  void openEndedDateRangeKeepsTheNullBound() {
    search(java.util.Map.of("created_from", "2026-02-01"));
    assertThat(BookingSearch.lastFilters.created)
        .isEqualTo(new DateRange(LocalDate.of(2026, 2, 1), null));
  }

  @Test
  void numberRangeKeysAssembleWhateverTheWireShape() {
    // strings (URL restore) and numbers (fresh widget) both coerce
    search(java.util.Map.of("total_from", "150", "total_to", 300));
    assertThat(BookingSearch.lastFilters.total).isEqualTo(new NumberRange(150.0, 300.0));
  }

  @Test
  void enumSetArrivesAsAListOrACommaJoinedString() {
    search(java.util.Map.of("channels", List.of("WEB", "PHONE")));
    assertThat(BookingSearch.lastFilters.channels)
        .containsExactlyInAnyOrder(Channel.WEB, Channel.PHONE);

    search(java.util.Map.of("channels", "WEB,AGENCY"));
    assertThat(BookingSearch.lastFilters.channels)
        .containsExactlyInAnyOrder(Channel.WEB, Channel.AGENCY);
  }

  @Test
  void blankBoundsAndStaleEnumValuesAreDroppedInsteadOfBreakingSearch() {
    search(java.util.Map.of("created_from", "", "created_to", ""));
    assertThat(BookingSearch.lastFilters.created).isNull();

    search(java.util.Map.of("channels", List.of("WEB", "RENAMED_AWAY")));
    assertThat(BookingSearch.lastFilters.channels).containsExactly(Channel.WEB);

    // an unparseable bound is dropped, not fatal
    assertThat(search(java.util.Map.of("created_from", "not-a-date", "created_to", "2026-12-31")))
        .hasSize(3);
  }
}
