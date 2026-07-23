package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Aggregate;
import io.mateu.uidl.annotations.GroupBy;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AggregateFunction;
import io.mateu.uidl.data.GroupSummary;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Listing aggregation: {@code @Aggregate} columns get totals over the WHOLE filtered result set
 * (the listing's footer), and the {@code @GroupBy} column groups the rows — implicit primary sort
 * plus one {@link GroupSummary} per group with its row count and per-group aggregates. Everything
 * is computed by {@code CrudRepository.summaries} (in-memory default here; DB repositories override
 * it with one aggregate query).
 */
class AggregatesSyncTest {

  public static class Sale implements Identifiable {
    String id;
    @GroupBy String region;
    String product;

    @Aggregate(AggregateFunction.sum)
    double amount;

    @Aggregate(AggregateFunction.count)
    String invoice;

    public Sale() {}

    public Sale(String id, String region, String product, double amount, String invoice) {
      this.id = id;
      this.region = region;
      this.product = product;
      this.amount = amount;
      this.invoice = invoice;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return id + " " + region + " " + product;
    }
  }

  static final List<Sale> SALES = new ArrayList<>();

  @UI("/sales")
  @Title("Sales")
  public static class SalesCrud extends AutoCrud<Sale> {
    @Override
    public CrudRepository<Sale> store() {
      return new CrudRepository<>() {
        @Override
        public Optional<Sale> findById(String id) {
          return SALES.stream().filter(sale -> sale.id().equals(id)).findFirst();
        }

        @Override
        public String save(Sale entity) {
          SALES.add(entity);
          return entity.id;
        }

        @Override
        public List<Sale> findAll() {
          return SALES;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          SALES.removeIf(sale -> selectedIds.contains(sale.id()));
        }
      };
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SalesCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    SALES.clear();
    SALES.add(new Sale("1", "North", "Widget", 100.0, "F-1"));
    SALES.add(new Sale("2", "South", "Widget", 50.0, "F-2"));
    SALES.add(new Sale("3", "North", "Gadget", 25.0, "F-3"));
    SALES.add(new Sale("4", "South", "Gadget", 25.0, null));
  }

  private UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/sales")
            .consumedRoute("/sales")
            .serverSideType(SalesCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .build());
  }

  private static CrudlDto findCrudl(Object component) {
    if (component instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.metadata() instanceof CrudlDto crudl) {
        return crudl;
      }
      for (var child : client.children()) {
        var found = findCrudl(child);
        if (found != null) {
          return found;
        }
      }
    }
    if (component instanceof io.mateu.dtos.ServerSideComponentDto server) {
      for (var child : server.children()) {
        var found = findCrudl(child);
        if (found != null) {
          return found;
        }
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private ListingData<Sale> search(Map<String, Object> state) {
    var increment = run("search", state);
    var data = (Map<String, Object>) increment.fragments().get(0).data();
    return (ListingData<Sale>) data.get("crud");
  }

  // ── wire shape ──────────────────────────────────────────────────────────────

  @Test
  void theColumnsCarryTheirAggregateAndTheCrudItsGroupByColumn() {
    var increment = run("", Map.of());
    var crudl = findCrudl(increment.fragments().get(0).component());
    assertThat(crudl).isNotNull();
    assertThat(crudl.groupBy()).isEqualTo("region");
    var byId = new java.util.HashMap<String, GridColumnDto>();
    crudl
        .columns()
        .forEach(
            column -> {
              if (column instanceof io.mateu.dtos.ClientSideComponentDto client
                  && client.metadata() instanceof GridColumnDto gridColumn) {
                byId.put(gridColumn.id(), gridColumn);
              }
            });
    assertThat(byId.get("amount").aggregate()).isEqualTo("sum");
    assertThat(byId.get("invoice").aggregate()).isEqualTo("count");
    assertThat(byId.get("product").aggregate()).isNull();
  }

  // ── computation ─────────────────────────────────────────────────────────────

  @Test
  void totalsAreComputedOverTheWholeFilteredSetAndTravelWithTheSearchResult() {
    var listing = search(Map.of("page", 0, "size", 2, "searchText", ""));
    // page size 2 but totals cover all four rows
    assertThat(listing.page().content()).hasSize(2);
    assertThat(listing.aggregates().get("amount")).isEqualTo(200.0);
    // count skips nulls (row 4 has no invoice)
    assertThat(listing.aggregates().get("invoice")).isEqualTo(3L);
  }

  @Test
  void groupsCarryCountAndPerGroupAggregatesAndRowsComeGroupSorted() {
    var listing = search(Map.of("page", 0, "size", 10, "searchText", ""));
    assertThat(listing.groups()).extracting(GroupSummary::value).containsExactly("North", "South");
    var north = listing.groups().get(0);
    assertThat(north.count()).isEqualTo(2);
    assertThat(north.aggregates().get("amount")).isEqualTo(125.0);
    // the @GroupBy column is the implicit primary sort, so groups are contiguous
    // (sorted listing rows travel as maps — the documented in-JVM wire shape — so the
    // list is read raw to dodge the generic checkcast)
    List<?> content = listing.page().content();
    assertThat(content.stream().map(row -> (Object) ((Map<?, ?>) row).get("region")).toList())
        .containsExactly("North", "North", "South", "South");
  }

  @Test
  void filteringRecomputesTheSummariesOverTheFilteredSetOnly() {
    var listing = search(Map.of("page", 0, "size", 10, "searchText", "Widget"));
    assertThat(listing.aggregates().get("amount")).isEqualTo(150.0);
    assertThat(listing.groups()).extracting(GroupSummary::value).containsExactly("North", "South");
    assertThat(listing.groups().get(0).count()).isEqualTo(1);
  }
}
