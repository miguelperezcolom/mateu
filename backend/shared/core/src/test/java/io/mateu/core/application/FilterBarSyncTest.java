package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The listing filter bar: every basic field of the filters class becomes a filter — including
 * ENUMS, which must arrive as select fields with their options (they used to be silently discarded,
 * leaving e.g. a status filter missing while the boolean one showed).
 */
class FilterBarSyncTest {

  @SuppressWarnings("unused")
  public enum Status {
    AVAILABLE,
    OUT_OF_STOCK
  }

  @SuppressWarnings("unused")
  public static class Product implements Identifiable {
    String id = "p1";
    String name = "Thing";
    boolean certified;
    Status status = Status.AVAILABLE;
    java.time.LocalDate added;

    @io.mateu.uidl.annotations.RangeFilter double price;

    public Product() {}

    public Product(
        String id,
        String name,
        boolean certified,
        Status status,
        java.time.LocalDate added,
        double price) {
      this.id = id;
      this.name = name;
      this.certified = certified;
      this.status = status;
      this.added = added;
      this.price = price;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name + " " + status;
    }
  }

  private static final List<Product> PRODUCTS =
      List.of(
          new Product(
              "p1", "Hammer", true, Status.AVAILABLE, java.time.LocalDate.of(2026, 1, 10), 10),
          new Product(
              "p2", "Wrench", false, Status.OUT_OF_STOCK, java.time.LocalDate.of(2026, 2, 10), 25),
          new Product(
              "p3",
              "Screwdriver",
              true,
              Status.OUT_OF_STOCK,
              java.time.LocalDate.of(2026, 3, 10),
              40));

  @SuppressWarnings("unused")
  @UI("/catalog")
  @Title("Catalog")
  public static class CatalogCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Product> {
    @Override
    public CrudRepository<Product> store() {
      return new CrudRepository<>() {
        @Override
        public Optional<Product> findById(String id) {
          return Optional.of(new Product());
        }

        @Override
        public String save(Product entity) {
          return entity.id();
        }

        @Override
        public List<Product> findAll() {
          return PRODUCTS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  // record-based entity (like the demo's Product): no no-arg constructor, so the
  // difference-from-default baseline must come from the canonical constructor — otherwise the
  // primitive certified=false of a state-hydrated filters record would count as a user-set filter
  @SuppressWarnings("unused")
  public record Gadget(String id, String name, boolean certified, Status status)
      implements Identifiable {}

  @SuppressWarnings("unused")
  @UI("/gadgets")
  @Title("Gadgets")
  public static class GadgetCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Gadget> {
    @Override
    public CrudRepository<Gadget> store() {
      return new CrudRepository<>() {
        @Override
        public Optional<Gadget> findById(String id) {
          return findAll().stream().filter(gadget -> gadget.id().equals(id)).findFirst();
        }

        @Override
        public String save(Gadget entity) {
          return entity.id();
        }

        @Override
        public List<Gadget> findAll() {
          return List.of(
              new Gadget("g1", "Drone", true, Status.AVAILABLE),
              new Gadget("g2", "Robot", false, Status.OUT_OF_STOCK),
              new Gadget("g3", "Sensor", true, Status.OUT_OF_STOCK));
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CatalogCrud.class, GadgetCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static io.mateu.dtos.CrudlDto listing() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/catalog")
                .consumedRoute("/catalog")
                .serverSideType(CatalogCrud.class.getName())
                .actionId("")
                .initiatorComponentId("cat_app")
                .build());
    var crudl = new java.util.ArrayList<io.mateu.dtos.CrudlDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.CrudlDto.class, crudl);
    assertThat(crudl).isNotEmpty();
    return crudl.get(0);
  }

  @Test
  void booleanFieldsBecomeFilters() {
    assertThat(listing().filters())
        .extracting(io.mateu.dtos.FormFieldDto::fieldId)
        .contains("certified");
  }

  private static io.mateu.dtos.FormFieldDto filterOf(String fieldId) {
    return listing().filters().stream()
        .filter(field -> fieldId.equals(field.fieldId()))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void enumFieldsBecomeMultiSelectFiltersWithTheirOptions() {
    // enums upgrade to multi-select (IN) on the crud filter bar; the options still travel
    var status = filterOf("status");
    assertThat(status.stereotype()).isEqualTo("multiSelect");
    assertThat(status.options())
        .extracting(io.mateu.dtos.OptionDto::value)
        .contains("AVAILABLE", "OUT_OF_STOCK");
  }

  @Test
  void temporalFieldsBecomeDateRangeFilters() {
    assertThat(filterOf("added").stereotype()).isEqualTo("dateRange");
  }

  @Test
  void rangeAnnotatedNumericFieldsBecomeNumberRangeFilters() {
    assertThat(filterOf("price").stereotype()).isEqualTo("numberRange");
  }

  // ── filter application (default in-memory CrudRepository.find) ────────────────

  private List<?> search(java.util.Map<String, Object> state) {
    var fullState = new java.util.HashMap<String, Object>();
    fullState.put("page", 0);
    fullState.put("size", 10);
    fullState.put("searchText", "");
    fullState.putAll(state);
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/catalog")
                .consumedRoute("/catalog")
                .serverSideType(CatalogCrud.class.getName())
                .actionId("search")
                .initiatorComponentId("cat_app")
                .componentState(fullState)
                .build());
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof java.util.Map<?, ?> data
          && data.get("crud") instanceof io.mateu.uidl.data.ListingData<?> listing) {
        return listing.page().content();
      }
    }
    throw new AssertionError("no listing data in the search response");
  }

  private static String idOf(Object row) {
    if (row instanceof Product product) {
      return product.id;
    }
    return String.valueOf(((java.util.Map<?, ?>) row).get("id"));
  }

  @Test
  void searchWithoutFiltersReturnsEverything() {
    // the hydrated filters instance carries the field initializers (status=AVAILABLE) — the
    // difference-from-default check must not mistake them for user-set filters
    assertThat(search(java.util.Map.of())).hasSize(3);
  }

  @Test
  void enumFilterRestrictsTheRows() {
    var rows = search(java.util.Map.of("status", "OUT_OF_STOCK"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactlyInAnyOrder("p2", "p3");
  }

  @Test
  void booleanFilterRestrictsTheRows() {
    var rows = search(java.util.Map.of("certified", true));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactlyInAnyOrder("p1", "p3");
  }

  @Test
  void stringFilterMatchesByContainmentIgnoringCase() {
    var rows = search(java.util.Map.of("name", "ham"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p1");
  }

  @Test
  void filtersCombine() {
    var rows = search(java.util.Map.of("status", "OUT_OF_STOCK", "certified", true));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p3");
  }

  // ── criteria filters: ranges and multi-select (can't live in the example object) ──

  @Test
  void enumMultiSelectListFiltersWithInSemantics() {
    var rows = search(java.util.Map.of("status", List.of("OUT_OF_STOCK")));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactlyInAnyOrder("p2", "p3");
    // several values = IN — the single-select example path could never express this
    assertThat(search(java.util.Map.of("status", List.of("AVAILABLE", "OUT_OF_STOCK")))).hasSize(3);
  }

  @Test
  void enumMultiSelectCommaStringComesFromUrlRestore() {
    var rows = search(java.util.Map.of("status", "AVAILABLE,OUT_OF_STOCK"));
    assertThat(rows).hasSize(3);
  }

  @Test
  void dateRangeFiltersBetween() {
    var rows = search(java.util.Map.of("added_from", "2026-01-15", "added_to", "2026-02-20"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p2");
  }

  @Test
  void dateRangeLowerBoundAloneIsGte() {
    var rows = search(java.util.Map.of("added_from", "2026-02-01"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactlyInAnyOrder("p2", "p3");
  }

  @Test
  void dateRangeUpperBoundAloneIsLte() {
    var rows = search(java.util.Map.of("added_to", "2026-01-31"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p1");
  }

  @Test
  void numberRangeFiltersBetween() {
    var rows = search(java.util.Map.of("price_from", "20", "price_to", "30"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p2");
  }

  @Test
  void criteriaAndExampleFiltersCombine() {
    var rows =
        search(
            java.util.Map.of(
                "price_from", "20", "status", List.of("OUT_OF_STOCK"), "certified", true));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p3");
  }

  @Test
  void unparseableRangeBoundsAreIgnored() {
    // a broken bound must not blow up the search nor filter anything out
    assertThat(search(java.util.Map.of("added_from", "not-a-date"))).hasSize(3);
  }

  // ── multi-word free-text search (AND over words, any order) ──────────────────

  @Test
  void multiWordSearchTextMatchesRowsContainingAllWords() {
    // toString is "<name> <status>" — the words live apart, so the literal phrase
    // "hammer available" reversed would never match as a whole string
    var rows = search(java.util.Map.of("searchText", "available hammer"));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p1");
  }

  @Test
  void multiWordSearchTextRequiresEveryWord() {
    // "wrench" matches p2 and "available" matches p1: no row contains both words
    assertThat(search(java.util.Map.of("searchText", "wrench available"))).isEmpty();
  }

  @Test
  void multiWordSearchTextIsCaseInsensitiveAndTolerantOfExtraSpaces() {
    var rows = search(java.util.Map.of("searchText", "  OUT_OF_STOCK   screw  "));
    assertThat(rows).extracting(FilterBarSyncTest::idOf).containsExactly("p3");
  }

  // ── record-based entity (canonical-constructor baseline) ──────────────────────

  private List<?> searchGadgets(java.util.Map<String, Object> state) {
    var fullState = new java.util.HashMap<String, Object>();
    fullState.put("page", 0);
    fullState.put("size", 10);
    fullState.put("searchText", "");
    fullState.putAll(state);
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/gadgets")
                .consumedRoute("/gadgets")
                .serverSideType(GadgetCrud.class.getName())
                .actionId("search")
                .initiatorComponentId("gad_app")
                .componentState(fullState)
                .build());
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof java.util.Map<?, ?> data
          && data.get("crud") instanceof io.mateu.uidl.data.ListingData<?> listing) {
        return listing.page().content();
      }
    }
    throw new AssertionError("no listing data in the search response");
  }

  private static String gadgetIdOf(Object row) {
    if (row instanceof Gadget gadget) {
      return gadget.id();
    }
    return String.valueOf(((java.util.Map<?, ?>) row).get("id"));
  }

  @Test
  void recordEntitySearchWithoutFiltersReturnsEverything() {
    // hydrating the filters record leaves certified=false — the canonical-constructor baseline
    // must recognize it as unset, not filter out the certified gadgets
    assertThat(searchGadgets(java.util.Map.of())).hasSize(3);
  }

  @Test
  void recordEntityEnumFilterRestrictsTheRows() {
    var rows = searchGadgets(java.util.Map.of("status", "OUT_OF_STOCK"));
    assertThat(rows)
        .extracting(FilterBarSyncTest::gadgetIdOf)
        .containsExactlyInAnyOrder("g2", "g3");
  }

  @Test
  void recordEntityBooleanFilterRestrictsTheRows() {
    var rows = searchGadgets(java.util.Map.of("certified", true));
    assertThat(rows)
        .extracting(FilterBarSyncTest::gadgetIdOf)
        .containsExactlyInAnyOrder("g1", "g3");
  }
}
