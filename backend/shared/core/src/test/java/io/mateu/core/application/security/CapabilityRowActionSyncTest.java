package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Strict action mode (M-S1) on a capability listing: a button column's {@code ColumnAction} names
 * the listing's method, so the row action runs (e2e row-click-opens-record).
 */
class CapabilityRowActionSyncTest {

  @UI("/cap-row-open")
  public static class People
      implements Listing<People.Row>, Navigable<People.Row, String>, Deletable<String> {
    public record Row(String id, String name, ColumnActionGroup actions) {}

    static final List<Row> ROWS =
        List.of(
            new Row(
                "R-001",
                "Ada",
                new ColumnActionGroup(
                    new ColumnAction[] {new ColumnAction("approve", "Approve")})));

    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return new ListingData<>(new Page<>("", ROWS.size(), 0, ROWS.size(), ROWS));
    }

    @Override
    public Row view(String id, HttpRequest httpRequest) {
      return ROWS.get(0);
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}

    public Message approve(Row row) {
      return new Message("Approved " + row.name());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(People.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static io.mateu.dtos.UIIncrementDto run(String actionId, Map<String, Object> params) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/")
            .consumedRoute("")
            .serverSideType(People.class.getName())
            .actionId(actionId)
            .componentState(Map.of())
            .parameters(params)
            .initiatorComponentId("c1")
            .build());
  }

  /**
   * The row action is advertised by the rows the listing SERVED (their ColumnAction), not by a
   * string literal of the class: before a search has handed it out, a crafted call is refused.
   */
  @Test
  void aRowActionNoServedRowOfferedIsRefused() {
    io.mateu.core.domain.out.fragmentmapper.mappers.IssuedActionsTestHook.forget();
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () ->
                run(
                    "action-on-row-approve",
                    Map.of("_clickedRow", Map.of("id", "R-001", "name", "Ada"))))
        .satisfies(
            e ->
                assertThat(io.mateu.core.application.security.MateuForbiddenException.find(e))
                    .isNotNull());
  }

  @Test
  void theColumnsActionRunsOnTheClickedRow() {
    // the listing serves its rows first — that is what hands the row action to the client
    run("search", Map.of());
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/")
                .consumedRoute("")
                .serverSideType(People.class.getName())
                .actionId("action-on-row-approve")
                .componentState(Map.of())
                .parameters(Map.of("_clickedRow", Map.of("id", "R-001", "name", "Ada")))
                .initiatorComponentId("c1")
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("Approved Ada");
  }

  // ── java-core #4: the row walk does not initialise what the rows hold lazily ──────────────

  /** A collection counting its initialisations, standing in for Hibernate's PersistentBag. */
  public static class LazyBag<E> extends java.util.AbstractList<E> {
    static final java.util.concurrent.atomic.AtomicInteger INITIALISED =
        new java.util.concurrent.atomic.AtomicInteger();
    private final List<E> items;

    LazyBag(List<E> items) {
      this.items = items;
    }

    @Override
    public E get(int index) {
      INITIALISED.incrementAndGet();
      return items.get(index);
    }

    @Override
    public int size() {
      INITIALISED.incrementAndGet();
      return items.size();
    }

    @Override
    public java.util.Iterator<E> iterator() {
      INITIALISED.incrementAndGet();
      return items.iterator();
    }
  }

  public static class Order {
    public String code = "O-1";

    @com.fasterxml.jackson.annotation.JsonIgnore
    public java.util.Collection<String> lines = new LazyBag<>(List.of("a", "b"));
  }

  @UI("/lazy-customers-crud")
  public static class CustomersCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Customer> {
    @Override
    public io.mateu.uidl.interfaces.CrudStore<Customer> store() {
      return new io.mateu.uidl.interfaces.CrudStore<>() {
        final List<Customer> rows = List.of(new Customer("c1", "Ada"), new Customer("c2", "Bea"));

        @Override
        public java.util.Optional<Customer> findById(String id) {
          return rows.stream().filter(c -> c.id.equals(id)).findFirst();
        }

        @Override
        public String save(Customer entity) {
          return entity.id;
        }

        @Override
        public List<Customer> findAll() {
          return rows;
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  public static class Customer implements io.mateu.uidl.interfaces.Identifiable {
    @Override
    public String id() {
      return id;
    }

    public String id;
    public String name;
    public ColumnAction open = new ColumnAction("approve", "Approve");
    public Order lastOrder = new Order();

    @com.fasterxml.jackson.annotation.JsonIgnore
    public java.util.Collection<Order> orders = new LazyBag<>(List.of(new Order(), new Order()));

    public Customer() {}

    Customer(String id, String name) {
      this.id = id;
      this.name = name;
    }
  }

  @UI("/lazy-customers")
  public static class Customers implements Listing<Customer> {
    @Override
    public ListingData<Customer> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Customer("c1", "Ada"), new Customer("c2", "Bea")));
    }

    public Message approve(Customer row) {
      return new Message("Approved " + row.name);
    }
  }

  @Test
  void servingRowsDoesNotWalkIntoWhatTheyHoldLazily() {
    try (var lazy = TestMateu.withUis(Customers.class, CustomersCrud.class)) {
      LazyBag.INITIALISED.set(0);
      lazy.run(
          RunActionRqDto.builder()
              .route("/lazy-customers-crud")
              .consumedRoute("/lazy-customers-crud")
              .serverSideType(CustomersCrud.class.getName())
              .actionId("search")
              .componentState(Map.of())
              .parameters(Map.of())
              .initiatorComponentId("c1")
              .build());
      assertThat(LazyBag.INITIALISED.get()).as("crud search").isZero();
      lazy.run(
          RunActionRqDto.builder()
              .route("/lazy-customers")
              .consumedRoute("/lazy-customers")
              .serverSideType(Customers.class.getName())
              .actionId("search")
              .componentState(Map.of())
              .parameters(Map.of())
              .initiatorComponentId("c1")
              .build());
      assertThat(LazyBag.INITIALISED.get()).isZero();
      // the row action the rows declare is still handed out
      var increment =
          lazy.run(
              RunActionRqDto.builder()
                  .route("/lazy-customers")
                  .consumedRoute("/lazy-customers")
                  .serverSideType(Customers.class.getName())
                  .actionId("action-on-row-approve")
                  .componentState(Map.of())
                  .parameters(Map.of("_clickedRow", Map.of("id", "c1", "name", "Ada")))
                  .initiatorComponentId("c1")
                  .build());
      assertThat(increment.messages()).extracting(m -> m.text()).contains("Approved Ada");
    }
  }
}
