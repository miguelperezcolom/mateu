package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.ReadOnlyUnless;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Editable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Independent re-verification, on the rc.1 code, of the GA round-2 Java findings — written from the
 * review's scenarios (design/ga-review-2), not from the fix commits' own tests. Shapes the fix
 * tests did not exercise are the point: other spellings, other ways in, other types.
 */
class Rc1ReverifyJavaSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  // ── J3: a final CONCRETE bean exposed by a getter (the constructor-injection idiom) ──────

  public static class OrderService {
    public String endpoint = "https://real-endpoint-123";

    public String getEndpoint() {
      return endpoint;
    }
  }

  static final OrderService ORDER_SERVICE = new OrderService();

  @UI("/rc1-held-concrete")
  public static class ConcreteHoldingView {
    private final OrderService service = ORDER_SERVICE;
    public String name = "x";

    // what Lombok @Getter / @Data on the view generates
    public OrderService getService() {
      return service;
    }

    @Action
    public Message save() {
      return new Message("name=" + name);
    }
  }

  // ── J2: the flattened a-b spelling of a guarded parent ─────────────────────────────────

  public static class Pay {
    @ReadOnlyUnless(roles = "manager")
    public double salary = 100;

    @EyesOnly(roles = "manager")
    public String secretNote = "top";

    public String note = "n";
  }

  @UI("/rc1-employee")
  public static class Employee {
    @Inline public Pay pay = new Pay();

    @Inline
    @ReadOnlyUnless(roles = "manager")
    public Pay locked = new Pay();

    @Inline
    @EyesOnly(roles = "manager")
    public Pay hidden = new Pay();

    @Action
    public Message save() {
      return new Message(
          "pay.salary="
              + pay.salary
              + " pay.secret="
              + pay.secretNote
              + " locked.note="
              + locked.note
              + " hidden.note="
              + hidden.note);
    }
  }

  // ── J5: more shapes than the fix test ──────────────────────────────────────────────────

  public record PayRecord(Pay pay) {}

  @UI("/rc1-shapes")
  public static class MoreShapes {
    public Map<String, List<Pay>> mapOfLists = Map.of("a", List.of(new Pay()));
    public List<List<Pay>> listOfLists = List.of(List.of(new Pay()));
    public java.util.Set<Pay> set = java.util.Set.of(new Pay());
    public PayRecord record = new PayRecord(new Pay());
    public Object anything = new Pay();
  }

  // ── J6: free-text search over a column the caller may not read ─────────────────────────

  public static class Secretive implements Identifiable {
    public String id;
    public String name;

    @EyesOnly(roles = "manager")
    public String salaryBand = "BAND-Z9";

    public Secretive() {}

    Secretive(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Secretive> SECRETIVE = new ArrayList<>();

  @UI("/rc1-secretive")
  public static class SecretiveCrud extends AutoCrud<Secretive> {
    @Override
    public CrudStore<Secretive> store() {
      return new ListStore<>(SECRETIVE, s -> s.id);
    }
  }

  // ── N1 on an AutoCrud (the review's shape) ─────────────────────────────────────────────

  public static class Customer {
    public String name = "ACME";
    @JsonManagedReference public List<Order> orders = new ArrayList<>();
  }

  public static class Order {
    public String id = "o1";
    public String title = "first";
    @JsonBackReference public Customer customer;
  }

  public static class Invoice implements Identifiable {
    public String id;
    public Customer customer;

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Invoice> INVOICES = new ArrayList<>();

  @UI("/rc1-invoices")
  public static class InvoiceCrud extends AutoCrud<Invoice> {
    @Override
    public CrudStore<Invoice> store() {
      return new ListStore<>(INVOICES, i -> i.id);
    }
  }

  // ── N2 with a separate editor class keyed by a @ReadOnly code ──────────────────────────

  public record Booking(String code, String guest, double total) {}

  public static class BookingEditor {
    @ReadOnly public String code;
    public String guest;
    @ReadOnly public double total;

    public BookingEditor() {}

    BookingEditor(Booking b) {
      code = b.code();
      guest = b.guest();
      total = b.total();
    }
  }

  static final Map<String, Booking> BOOKINGS = new ConcurrentHashMap<>();

  @UI("/rc1-bookings")
  public static class Bookings implements Listing<Booking>, Editable<BookingEditor, String> {
    @Override
    public ListingData<Booking> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.copyOf(BOOKINGS.values()));
    }

    @Override
    public BookingEditor edit(String id, HttpRequest httpRequest) {
      var b = BOOKINGS.get(id);
      return b == null ? null : new BookingEditor(b);
    }

    @Override
    public String save(HttpRequest httpRequest) {
      var e = httpRequest.getComponentState(BookingEditor.class);
      BOOKINGS.put(String.valueOf(e.code), new Booking(e.code, e.guest, e.total));
      return e.code;
    }
  }

  // ── N3/N4/N5 + B-1 (Java): AutoCrud save rules ─────────────────────────────────────────

  public static class Item implements Identifiable {
    @io.mateu.uidl.annotations.EditableOnlyWhenCreating public String id;
    public String title;

    @EyesOnly(roles = "manager")
    public String internal;

    @ReadOnly public double price;
    @Hidden public String tenant;
    @JsonIgnore public String passwordHash;

    public Item() {}

    Item(String id, String title) {
      this.id = id;
      this.title = title;
      this.internal = "MANAGER ONLY";
      this.price = 249;
      this.tenant = "acme";
      this.passwordHash = "HASH";
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Item> ITEMS = new ArrayList<>();

  @UI("/rc1-items")
  public static class ItemCrud extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return new ListStore<>(ITEMS, i -> i.id);
    }
  }

  /** A store that never assigns an id (B-1: what the old docs taught), technical id. */
  public static class Note implements Identifiable {
    public String id;
    public String text;

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Note> NOTES = new ArrayList<>();

  @UI("/rc1-notes")
  public static class NoteCrud extends AutoCrud<Note> {
    @Override
    public CrudStore<Note> store() {
      return new ListStore<>(NOTES, n -> n.id);
    }
  }

  /** A store that only REPLACES (the four Explorer stores, Explorer N3): save returns the id. */
  public static class Sku implements Identifiable {
    public String id;
    public String title;

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Sku> SKUS = new ArrayList<>();

  @UI("/rc1-skus")
  public static class ReplaceOnlyCrud extends AutoCrud<Sku> {
    @Override
    public CrudStore<Sku> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Sku> findById(String id) {
          return SKUS.stream().filter(s -> java.util.Objects.equals(s.id, id)).findFirst();
        }

        @Override
        public String save(Sku entity) {
          SKUS.replaceAll(s -> java.util.Objects.equals(s.id, entity.id) ? entity : s);
          return entity.id;
        }

        @Override
        public List<Sku> findAll() {
          return SKUS;
        }

        @Override
        public void deleteAllById(List<String> ids) {
          SKUS.removeIf(s -> ids.contains(s.id));
        }
      };
    }
  }

  static class ListStore<T extends Identifiable> implements CrudStore<T> {
    final List<T> list;
    final java.util.function.Function<T, String> idOf;

    ListStore(List<T> list, java.util.function.Function<T, String> idOf) {
      this.list = list;
      this.idOf = idOf;
    }

    @Override
    public Optional<T> findById(String id) {
      return list.stream().filter(t -> java.util.Objects.equals(idOf.apply(t), id)).findFirst();
    }

    @Override
    public String save(T entity) {
      list.removeIf(t -> java.util.Objects.equals(idOf.apply(t), idOf.apply(entity)));
      list.add(entity);
      return idOf.apply(entity);
    }

    @Override
    public List<T> findAll() {
      return list;
    }

    @Override
    public void deleteAllById(List<String> ids) {
      list.removeIf(t -> ids.contains(idOf.apply(t)));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            ConcreteHoldingView.class,
            Employee.class,
            MoreShapes.class,
            SecretiveCrud.class,
            InvoiceCrud.class,
            Bookings.class,
            ItemCrud.class,
            NoteCrud.class,
            ReplaceOnlyCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(
      String route, String consumed, Class<?> type, String action, Map<String, Object> state) {
    return run(route, consumed, type, action, state, Map.of());
  }

  private static UIIncrementDto run(
      String route,
      String consumed,
      Class<?> type,
      String action,
      Map<String, Object> state,
      Map<String, Object> params,
      String... roles) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumed)
            .serverSideType(type.getName())
            .actionId(action)
            .initiatorComponentId("c1")
            .componentState(state)
            .parameters(params)
            .build(),
        roles.length == 0 ? Map.of() : TestIdentities.headersWithRoles(roles));
  }

  private static String json(Object o) {
    return JSON.valueToTree(o).toString();
  }

  private static String text(UIIncrementDto increment) {
    return increment.messages().isEmpty() ? "" : increment.messages().get(0).text();
  }

  @Test
  void j3_aFinalConcreteBeanExposedByAGetterIsNotWrittenNorWrittenThroughADottedKey() {
    var state = new LinkedHashMap<String, Object>();
    state.put("service", Map.of("endpoint", "http://evil"));
    state.put("service.endpoint", "http://evil2");
    state.put("service-endpoint", "http://evil3");
    run("/rc1-held-concrete", "/rc1-held-concrete", ConcreteHoldingView.class, "save", state);
    assertThat(ORDER_SERVICE.endpoint).isEqualTo("https://real-endpoint-123");
  }

  @Test
  void j2_theFlattenedSpellingOfAGuardedParentDoesNotWritePastIt() {
    var state = new LinkedHashMap<String, Object>();
    state.put("locked-note", "PWN4");
    state.put("hidden-note", "PWN5");
    state.put("pay-salary", 998);
    state.put("pay-secretNote", "pwned");
    assertThat(text(run("/rc1-employee", "/rc1-employee", Employee.class, "save", state)))
        .isEqualTo("pay.salary=100.0 pay.secret=top locked.note=n hidden.note=n");
  }

  @Test
  void n1_anAutoCrudListingOverABidirectionalGraphSearches() {
    INVOICES.clear();
    var inv = new Invoice();
    inv.id = "i1";
    inv.customer = new Customer();
    var o = new Order();
    o.customer = inv.customer;
    inv.customer.orders.add(o);
    INVOICES.add(inv);
    var rows = json(run("/rc1-invoices", "/rc1-invoices", InvoiceCrud.class, "search", Map.of()));
    assertThat(rows).contains("ACME");
  }

  @Test
  void n2_aSeparateEditorKeyedByAReadOnlyCodeKeepsTheStoredTotalAndAddsNoNullKey() {
    BOOKINGS.clear();
    BOOKINGS.put("B1", new Booking("B1", "Ana", 300.0));
    run("/rc1-bookings", "/rc1-bookings", Bookings.class, "view", Map.of("code", "B1"));
    run(
        "/rc1-bookings",
        "/rc1-bookings",
        Bookings.class,
        "save",
        Map.of("code", "B1", "guest", "Ana Maria", "total", 999.0));
    assertThat(BOOKINGS).containsOnlyKeys("B1");
    assertThat(BOOKINGS.get("B1")).isEqualTo(new Booking("B1", "Ana Maria", 300.0));
  }

  @Test
  void n3_n4_n5_saveRules() {
    ITEMS.clear();
    ITEMS.add(new Item("1", "hello"));
    // N3: create over a stored id
    var created =
        run(
            "/rc1-items/new",
            "/rc1-items",
            ItemCrud.class,
            "create",
            Map.of("id", "1", "title", "dup"));
    assertThat(json(created)).contains("already exists");
    var stored = ITEMS.get(0);
    assertThat(stored.title).isEqualTo("hello");
    assertThat(stored.internal).isEqualTo("MANAGER ONLY");
    assertThat(stored.price).isEqualTo(249.0);
    assertThat(stored.tenant).isEqualTo("acme");
    // N4 + N5: honest edit with forged hidden/never-sent fields
    var state = new LinkedHashMap<String, Object>();
    state.put("id", "1");
    state.put("title", "hello 2");
    state.put("tenant", "other");
    state.put("passwordHash", "X");
    state.put("price", 1.0);
    state.put("internal", "pwned");
    run("/rc1-items/1/edit", "/rc1-items", ItemCrud.class, "save", state);
    stored = ITEMS.stream().filter(i -> i.id.equals("1")).findFirst().orElseThrow();
    assertThat(stored.title).isEqualTo("hello 2");
    assertThat(stored.tenant).isEqualTo("acme");
    assertThat(stored.passwordHash).isEqualTo("HASH");
    assertThat(stored.price).isEqualTo(249.0);
    assertThat(stored.internal).isEqualTo("MANAGER ONLY");
  }

  @Test
  void b1_aCreateTheStoreLeavesWithoutAnIdIsNotReportedAsSaved() {
    NOTES.clear();
    var first =
        json(run("/rc1-notes/new", "/rc1-notes", NoteCrud.class, "create", Map.of("text", "n0")));
    run("/rc1-notes/new", "/rc1-notes", NoteCrud.class, "create", Map.of("text", "n1"));
    // the docs' old store: no id assigned. The user is told, never "saved".
    assertThat(first).doesNotContain("saved successfully").contains("saved without an id");
  }

  @Test
  void explorerN3_aCreateTheStoreNeverInsertedDoesNotNavigateToNull() {
    SKUS.clear();
    var answer =
        json(
            run(
                "/rc1-skus/new",
                "/rc1-skus",
                ReplaceOnlyCrud.class,
                "create",
                Map.of("title", "new one")));
    // before: navigated to /rc1-skus/null ("Not found"); now the store's missing id is reported
    assertThat(answer).doesNotContain("/null").contains("saved without an id");
  }
}
