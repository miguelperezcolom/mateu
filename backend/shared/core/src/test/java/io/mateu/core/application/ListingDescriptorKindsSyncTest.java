package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ListingFilterDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.RangeFilter;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NumberRange;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Filterable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The URL contract a menu entry advertises for the listing it opens, per filter type: booleans,
 * numbers, dates and date-times as single values on a plain listing; ranges (a {@code NumberRange},
 * a {@code @RangeFilter} number, a date-time) once the listing has CRUD semantics; hidden and
 * static filter fields are not part of it, and a map of filters declares none.
 */
class ListingDescriptorKindsSyncTest {

  public record Row(String id, String name) {}

  public static class PlainFilters {
    static String CONSTANT = "x";

    public Boolean active;
    public int minNights;
    public BigDecimal maxPrice;
    public LocalDate arrival;
    public LocalDateTime createdAt;
    public NumberRange guests;
    public List<String> tags; // not a filter the URL can carry

    @Hidden public String internal;
  }

  public static class CrudFilters {
    @RangeFilter public Integer nights;
    public LocalDateTime updatedAt;
  }

  public abstract static class RowsListing implements Listing<Row> {
    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Row("r1", "one")));
    }
  }

  @UI("/descriptor-plain")
  @Title("Plain")
  public static class PlainRows extends RowsListing implements Filterable<PlainFilters> {}

  @UI("/descriptor-crud")
  @Title("Crud")
  public static class CrudRows extends RowsListing
      implements Filterable<CrudFilters>, Navigable<Row, String> {
    @Override
    public Row view(String id, HttpRequest httpRequest) {
      return new Row(id, id);
    }
  }

  @UI("/descriptor-map")
  @Title("Map")
  public static class MapRows extends RowsListing implements Filterable<Map<String, Object>> {}

  @UI("/descriptor-app")
  @Title("App")
  public static class DescriptorApp {
    @Menu PlainRows plain;
    @Menu CrudRows crud;
    @Menu MapRows map;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DescriptorApp.class, PlainRows.class, CrudRows.class, MapRows.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static MenuOptionDto entry(String label) {
    var app =
        WireWalk.first(
            mateu.run(
                RunActionRqDto.builder()
                    .route("/descriptor-app")
                    .consumedRoute("_empty")
                    .actionId("")
                    .build()),
            AppDto.class);
    return app.menu().stream()
        .filter(o -> label.equals(o.label()))
        .findFirst()
        .orElseThrow(() -> new AssertionError(label + " not in " + app.menu()));
  }

  private static Map<String, ListingFilterDto> filters(String label) {
    var map = new java.util.LinkedHashMap<String, ListingFilterDto>();
    entry(label).listing().filters().forEach(f -> map.put(f.param(), f));
    return map;
  }

  @Test
  void aPlainListingAdvertisesSingleValueFiltersPerType() {
    var filters = filters("Plain");
    assertThat(filters.keySet())
        .containsExactly("active", "minNights", "maxPrice", "arrival", "createdAt", "guests");
    assertThat(filters.get("active").type()).isEqualTo("boolean");
    assertThat(filters.get("minNights").type()).isEqualTo("number");
    assertThat(filters.get("maxPrice").type()).isEqualTo("number");
    assertThat(filters.get("arrival").type()).isEqualTo("date");
    assertThat(filters.get("createdAt").type()).isEqualTo("dateTime");
    var guests = filters.get("guests");
    assertThat(guests.type()).isEqualTo("numberRange");
    assertThat(guests.fromParam()).isEqualTo("guests_from");
    assertThat(guests.toParam()).isEqualTo("guests_to");
    assertThat(entry("Plain").listing().searchParam()).isNull();
  }

  @Test
  void crudSemanticsTurnRangeNumbersAndDateTimesIntoRanges() {
    var filters = filters("Crud");
    assertThat(filters.get("nights").type()).isEqualTo("numberRange");
    assertThat(filters.get("updatedAt").type()).isEqualTo("dateTimeRange");
    assertThat(filters.get("updatedAt").fromParam()).isEqualTo("updatedAt_from");
  }

  @Test
  void aMapOfFiltersDeclaresNone() {
    assertThat(entry("Map").listing().filters()).isEmpty();
    assertThat(entry("Map").listing().idField()).isEqualTo("id");
  }
}
