package io.mateu.uidl.interfaces;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.FilterCriterion;
import io.mateu.uidl.data.FilterOperator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * The part of {@link CrudStore#find} every AutoCrud without its own store query relies on: the
 * field-level filters (an example object — a field counts only when it differs from a fresh
 * instance) and the range/list {@link FilterCriterion criteria}. {@code CrudStoreFindTest} covers
 * search text, sort and paging; nothing pinned these.
 */
class CrudStoreFiltersAndCriteriaTest {

  enum Status {
    OPEN,
    CLOSED
  }

  /** A record entity: its "fresh instance" is the canonical constructor fed null/zero/false. */
  record Booking(String id, String guest, int nights, boolean vip, Status status, LocalDate arrival)
      implements Identifiable {}

  /** A class entity with initializers: an untouched field keeps them and must not filter. */
  public static class Room implements Identifiable {
    public String id;
    public String type = "";
    public int floor = 1;
    public Status status = Status.OPEN;

    public Room() {}

    Room(String id, String type, int floor, Status status) {
      this.id = id;
      this.type = type;
      this.floor = floor;
      this.status = status;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static <T extends Identifiable> CrudStore<T> storeOf(List<T> rows) {
    return new CrudStore<>() {
      @Override
      public Optional<T> findById(String id) {
        return rows.stream().filter(r -> r.id().equals(id)).findFirst();
      }

      @Override
      public String save(T entity) {
        return entity.id();
      }

      @Override
      public List<T> findAll() {
        return rows;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }

  static final List<Booking> BOOKINGS =
      List.of(
          new Booking("1", "Ana Pérez", 3, true, Status.OPEN, LocalDate.of(2026, 3, 1)),
          new Booking("2", "Luis Gómez", 1, false, Status.CLOSED, LocalDate.of(2026, 3, 15)),
          new Booking("3", "Ana Gómez", 7, false, Status.OPEN, LocalDate.of(2026, 4, 2)),
          new Booking("4", "Marta Ruiz", 2, true, Status.CLOSED, null));

  private static List<String> ids(io.mateu.uidl.data.Page<? extends Identifiable> page) {
    return page.content().stream().map(Identifiable::id).toList();
  }

  @Test
  void aStringFilterMatchesByCaseInsensitiveContainment() {
    var filters = new Booking(null, "gÓMEZ", 0, false, null, null);
    assertThat(ids(storeOf(BOOKINGS).find(null, filters, null))).containsExactly("2", "3");
  }

  @Test
  void primitiveDefaultsOfARecordExampleDoNotFilter() {
    // nights 0 and vip false are the record's defaults: untouched, not "nights = 0 and not vip"
    var filters = new Booking(null, null, 0, false, null, null);
    assertThat(ids(storeOf(BOOKINGS).find(null, filters, null)))
        .containsExactly("1", "2", "3", "4");
  }

  @Test
  void nonDefaultBasicValuesFilterByEquality() {
    var vip = new Booking(null, null, 0, true, null, null);
    assertThat(ids(storeOf(BOOKINGS).find(null, vip, null))).containsExactly("1", "4");
    var closed = new Booking(null, null, 0, false, Status.CLOSED, null);
    assertThat(ids(storeOf(BOOKINGS).find(null, closed, null))).containsExactly("2", "4");
  }

  @Test
  void filtersSearchTextAndCombineWithAnd() {
    var open = new Booking(null, null, 0, false, Status.OPEN, null);
    // every word of the search must appear, in any order
    assertThat(ids(storeOf(BOOKINGS).find("gómez ana", open, null))).containsExactly("3");
  }

  @Test
  void aClassExampleIgnoresFieldsLeftAtTheirInitializers() {
    var rooms =
        List.of(
            new Room("101", "Double", 1, Status.OPEN),
            new Room("201", "Suite", 2, Status.CLOSED),
            new Room("202", "Double", 2, Status.OPEN));
    var untouched = new Room();
    assertThat(ids(storeOf(rooms).find(null, untouched, null))).hasSize(3);

    var secondFloor = new Room();
    secondFloor.floor = 2;
    assertThat(ids(storeOf(rooms).find(null, secondFloor, null))).containsExactly("201", "202");

    // the flip side, documented: filtering BY the initializer value is not possible by example
    var firstFloor = new Room();
    firstFloor.floor = 1;
    assertThat(ids(storeOf(rooms).find(null, firstFloor, null))).hasSize(3);
  }

  @Test
  void aBetweenCriterionIsInclusiveAndANullRowValueNeverMatches() {
    var march =
        new FilterCriterion(
            "arrival",
            FilterOperator.between,
            List.of(LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 15)));
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(march), null)))
        .containsExactly("1", "2");
  }

  @Test
  void anOpenEndedBetweenOnlyChecksItsLowerBound() {
    var fromMarch10 =
        new FilterCriterion("arrival", FilterOperator.between, List.of(LocalDate.of(2026, 3, 10)));
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(fromMarch10), null)))
        .containsExactly("2", "3");
  }

  @Test
  void numericBoundsCompareNumericallyWhateverTheirBoxedType() {
    var atLeast3 = new FilterCriterion("nights", FilterOperator.gte, List.of(3L));
    var atMost3 = new FilterCriterion("nights", FilterOperator.lte, List.of(new BigDecimal("3.0")));
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(atLeast3), null)))
        .containsExactly("1", "3");
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(atMost3), null)))
        .containsExactly("1", "2", "4");
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(atLeast3, atMost3), null)))
        .containsExactly("1");
  }

  @Test
  void anInCriterionMatchesEnumConstantsOrTheirNames() {
    var byName = new FilterCriterion("status", FilterOperator.in, List.of("CLOSED"));
    var byConstant = new FilterCriterion("status", FilterOperator.in, List.of(Status.OPEN));
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(byName), null)))
        .containsExactly("2", "4");
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(byConstant), null)))
        .containsExactly("1", "3");
  }

  @Test
  void aCriterionWithoutValuesIsIgnored() {
    var empty = new FilterCriterion("status", FilterOperator.in, List.of());
    assertThat(ids(storeOf(BOOKINGS).find(null, null, List.of(empty), null))).hasSize(4);
  }

  @Test
  void criteriaFiltersAndSearchTextAllApplyAndTheTotalCountsTheFilteredRows() {
    var open = new Booking(null, null, 0, false, Status.OPEN, null);
    var longStays = new FilterCriterion("nights", FilterOperator.gte, List.of(2));
    var page =
        storeOf(BOOKINGS)
            .find(
                "ana", open, List.of(longStays), new io.mateu.uidl.data.Pageable(0, 1, List.of()));
    assertThat(page.totalElements()).isEqualTo(2);
    assertThat(ids(page)).containsExactly("1");
  }
}
