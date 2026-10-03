package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A record master whose tabs are PAGES: {@code /_mdt/customers/:customerId} is an {@code App(TABS)}
 * and its registry {@code children} ({@code orders}, {@code notes}) are its tabs, each with a URL
 * of its own. What has to hold, request by request, is what the browser does on a reload, a pasted
 * link or back/forward — a FRESH load of a tab's URL:
 *
 * <ol>
 *   <li>the enclosing app's home is the MASTER (the chain's outermost level not on screen), not the
 *       tab's class — otherwise the tab renders with no master around it;
 *   <li>the master, loaded by its type, gets {@code :customerId} and renders the requested tab as
 *       its home — or its default tab when the URL names none;
 *   <li>the tab, loaded by its type, gets {@code :customerId} too, and a listing loaded that way
 *       opens as a listing (its mediator), not as a record whose id is its own mount.
 * </ol>
 */
class RoutedMasterTabsSyncTest {

  public static class Order implements Identifiable {
    public String id;
    public String customerId;
    public String status;

    public Order() {}

    Order(String id, String customerId, String status) {
      this.id = id;
      this.customerId = customerId;
      this.status = status;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return "Order " + id;
    }
  }

  static final List<Order> ORDERS = new ArrayList<>();

  /** The tab: the orders of ONE customer, the one the route names. */
  @Title("Orders")
  public static class CustomerOrders extends AutoCrud<Order> {
    public String customerId;

    static final Map<String, String> SEEN = new HashMap<>();

    @Override
    public CrudStore<Order> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Order> findById(String id) {
          return ORDERS.stream().filter(o -> o.id.equals(id)).findFirst();
        }

        @Override
        public String save(Order entity) {
          if (entity.id == null || entity.id.isBlank()) {
            entity.id = customerId + "-" + (ORDERS.size() + 1);
            entity.customerId = customerId;
            ORDERS.add(entity);
          }
          return entity.id;
        }

        @Override
        public List<Order> findAll() {
          SEEN.put("findAll", String.valueOf(customerId));
          return ORDERS.stream().filter(o -> o.customerId.equals(customerId)).toList();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          ORDERS.removeIf(o -> selectedIds.contains(o.id));
        }
      };
    }
  }

  @Title("Notes")
  public static class CustomerNotes {
    public String customerId;
    public String note = "notes";
  }

  /** The listing a master is opened from: a row goes to the master's route. */
  @Title("Customers")
  @io.mateu.uidl.annotations.RowRoute("/_mdt/customers/${row.id}")
  public static class Customers extends AutoCrud<Order> {
    @Override
    public CrudStore<Order> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Order> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Order entity) {
          return entity.id;
        }

        @Override
        public List<Order> findAll() {
          return List.of();
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {}
      };
    }
  }

  /** The master: an App(TABS) with NO menu of its own — its tabs are its registry children. */
  @App(AppVariant.TABS)
  public static class CustomerMaster implements TitleSupplier {
    public String customerId;

    @Override
    public String title() {
      return "Customer " + customerId;
    }
  }

  /** The same master, but naming its default tab with `defaultChild`. */
  @App(AppVariant.TABS)
  public static class SupplierMaster {
    public String supplierId;
  }

  @UI("/_mdt")
  @Title("Mdt")
  public static class MdtHome {
    @Menu String customers = "/_mdt/customers";
  }

  /** The registry, authored in code: the same tree a routes.yaml `children:` block describes. */
  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.of("_mdt/customers", Customers.class.getName()),
          new RouteEntry(
              "_mdt/customers/:customerId",
              null,
              CustomerMaster.class.getName(),
              null,
              null,
              null,
              List.of(
                  RouteEntry.of("orders", CustomerOrders.class.getName()),
                  RouteEntry.of("notes", CustomerNotes.class.getName()),
                  flagged("audit", CustomerNotes.class, "audit"))),
          new RouteEntry(
              "_mdt/partners/:partnerId",
              null,
              SupplierMaster.class.getName(),
              null,
              null,
              null,
              List.of(
                  RouteEntry.of("orders", CustomerOrders.class.getName()),
                  flagged("notes", CustomerNotes.class, "audit")),
              null,
              null,
              null,
              null,
              "notes"),
          new RouteEntry(
              "_mdt/suppliers/:supplierId",
              null,
              SupplierMaster.class.getName(),
              null,
              null,
              null,
              List.of(
                  RouteEntry.of("orders", CustomerOrders.class.getName()),
                  RouteEntry.of("notes", CustomerNotes.class.getName())),
              null,
              null,
              null,
              null,
              "notes"));
    }
  }

  private static RouteEntry flagged(String route, Class<?> viewModel, String show) {
    return new RouteEntry(
        route,
        null,
        viewModel.getName(),
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        show);
  }

  /** The flags this deployment answers: `audit` is off, everything else unknown (= on). */
  public static class Flags implements io.mateu.uidl.interfaces.FeatureFlags {
    @Override
    public Boolean isEnabled(String flag, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      return "audit".equals(flag) ? Boolean.FALSE : null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Routes(), new Flags()), MdtHome.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void seed() {
    ORDERS.clear();
    ORDERS.add(new Order("7-1", "7", "OPEN"));
    ORDERS.add(new Order("7-2", "7", "SHIPPED"));
    ORDERS.add(new Order("8-1", "8", "OPEN"));
    CustomerOrders.SEEN.clear();
  }

  private static UIIncrementDto load(String route, String consumedRoute, Class<?> type) {
    return load(route, consumedRoute, type, Map.of());
  }

  private static UIIncrementDto load(
      String route, String consumedRoute, Class<?> type, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumedRoute)
            .serverSideType(type == null ? null : type.getName())
            .actionId("")
            .initiatorComponentId("ux")
            .componentState(state)
            .parameters(Map.of())
            .build());
  }

  private static AppDto appOf(UIIncrementDto increment) {
    return FullSyncPipelineTest.findMetadata(
        increment.fragments().get(0).component(), AppDto.class);
  }

  // ── the registry ─────────────────────────────────────────────────────────

  @Test
  void theChainOfATabIsTheMasterThenTheTab() {
    var registry = mateu.context().getBean(RouteRegistry.class);
    var chain = registry.chain("/_mdt/customers/7/orders");
    assertThat(chain)
        .extracting(RouteRegistry.ChainLink::path)
        .containsExactly("/_mdt/customers/7", "/_mdt/customers/7/orders");
    assertThat(chain.get(0).pathParams()).containsEntry("customerId", "7");
    assertThat(registry.outermostPending("/_mdt/customers/7/orders", "/_mdt/customers/7"))
        .get()
        .extracting(RouteRegistry.ChainLink::path)
        .isEqualTo("/_mdt/customers/7/orders");
  }

  @Test
  void theDefaultChildIsTheFirstOneUnlessOneIsNamed() {
    var registry = mateu.context().getBean(RouteRegistry.class);
    assertThat(registry.defaultChildPath("/_mdt/customers/7")).contains("/_mdt/customers/7/orders");
    assertThat(registry.defaultChildPath("/_mdt/suppliers/3")).contains("/_mdt/suppliers/3/notes");
    assertThat(registry.defaultChildPath("/_mdt/customers/7/orders")).isEmpty();
  }

  // ── a fresh load (reload / deep link / back-forward) ─────────────────────

  @Test
  void aDeepLinkToATabHomesTheEnclosingAppOnTheMaster() {
    var app = appOf(load("/_mdt/customers/7/orders", "_empty", null));
    assertThat(app.serverSideType()).isEqualTo(MdtHome.class.getName());
    assertThat(app.homeRoute()).isEqualTo("/_mdt/customers/7/orders");
    assertThat(app.homeServerSideType())
        .as("the master renders the tab in its slot; typing the home with the tab skips it")
        .isEqualTo(CustomerMaster.class.getName());
  }

  @Test
  void aDeepLinkToARecordInsideATabGoesThroughTheMasterAndTheTab() {
    var root = appOf(load("/_mdt/customers/7/orders/7-2", "_empty", null));
    assertThat(root.homeServerSideType()).isEqualTo(CustomerMaster.class.getName());
    var master = appOf(load("/_mdt/customers/7/orders/7-2", "", CustomerMaster.class));
    assertThat(master.homeRoute()).isEqualTo("/_mdt/customers/7/orders/7-2");
    assertThat(master.homeServerSideType())
        .as("past the tab's route the path is the tab's own (a record of its crud)")
        .isEqualTo(CustomerOrders.class.getName());
    var tab =
        appOf(load("/_mdt/customers/7/orders/7-2", "/_mdt/customers/7", CustomerOrders.class));
    assertThat(tab.homeRoute()).isEqualTo("/_mdt/customers/7/orders/7-2");
    assertThat(tab.homeConsumedRoute()).isEqualTo("/_mdt/customers/7/orders");
  }

  @Test
  void theMasterLoadedByTypeGetsItsIdAndHomesOnTheRequestedTab() {
    var app = appOf(load("/_mdt/customers/7/orders", "", CustomerMaster.class));
    assertThat(app.serverSideType()).isEqualTo(CustomerMaster.class.getName());
    assertThat(app.title()).isEqualTo("Customer 7");
    assertThat(app.route()).isEqualTo("/_mdt/customers/7");
    assertThat(app.homeRoute()).isEqualTo("/_mdt/customers/7/orders");
    assertThat(app.homeConsumedRoute()).isEqualTo("/_mdt/customers/7");
    assertThat(app.homeServerSideType()).isEqualTo(CustomerOrders.class.getName());
  }

  @Test
  void aMasterWithNoMenuOffersItsChildrenAsTabs() {
    var app = appOf(load("/_mdt/customers/7", "", CustomerMaster.class));
    assertThat(app.menu())
        .extracting(option -> option.route())
        .containsExactly("/_mdt/customers/7/orders", "/_mdt/customers/7/notes");
    assertThat(app.menu()).extracting(option -> option.label()).containsExactly("Orders", "Notes");
  }

  @Test
  void aTabWhoseFlagIsOffIsLeftOutOfTheBarButItsRouteStillAnswers() {
    var app = appOf(load("/_mdt/customers/7", "", CustomerMaster.class));
    assertThat(app.menu())
        .extracting(option -> option.route())
        .doesNotContain("/_mdt/customers/7/audit");
    var hidden = appOf(load("/_mdt/customers/7/audit", "", CustomerMaster.class));
    assertThat(hidden.homeRoute()).isEqualTo("/_mdt/customers/7/audit");
    assertThat(hidden.homeServerSideType()).isEqualTo(CustomerNotes.class.getName());
  }

  @Test
  void aHiddenDefaultTabFallsBackToTheFirstVisibleOne() {
    var app = appOf(load("/_mdt/partners/3", "", SupplierMaster.class));
    assertThat(app.homeRoute()).isEqualTo("/_mdt/partners/3/orders");
  }

  @Test
  void theMasterReachedOnItsOwnOpensItsDefaultTab() {
    var app = appOf(load("/_mdt/customers/7", "", CustomerMaster.class));
    assertThat(app.homeRoute()).isEqualTo("/_mdt/customers/7/orders");
    assertThat(app.homeServerSideType()).isEqualTo(CustomerOrders.class.getName());

    var named = appOf(load("/_mdt/suppliers/3", "", SupplierMaster.class));
    assertThat(named.homeRoute()).isEqualTo("/_mdt/suppliers/3/notes");
  }

  @Test
  void theTabLoadedByTypeOpensAsAListingOfTheRightCustomer() {
    var increment = load("/_mdt/customers/7/orders", "/_mdt/customers/7", CustomerOrders.class);
    assertThat(increment.messages())
        .as("the listing must not read its own mount (/orders) as a record id")
        .isNullOrEmpty();
    // the first load of a listing by type is its mediator, mounted at the tab's route
    var mediator = appOf(increment);
    assertThat(mediator.homeConsumedRoute()).isEqualTo("/_mdt/customers/7/orders");
    // ...and the listing it then loads searches the customer the route names
    var listing =
        load(
            "/_mdt/customers/7/orders",
            "/_mdt/customers/7/orders",
            CustomerOrders.class,
            Map.of("_route", "", "_componentRoute", "/_mdt/customers/7/orders"));
    assertThat(listing.fragments()).isNotEmpty();
    var search =
        mateu.run(
            RunActionRqDto.builder()
                .route("/_mdt/customers/7/orders")
                .consumedRoute("/_mdt/customers/7/orders")
                .serverSideType(CustomerOrders.class.getName())
                .actionId("search")
                .initiatorComponentId("ux")
                .componentState(
                    Map.of("_route", "/list", "_componentRoute", "/_mdt/customers/7/orders"))
                .parameters(Map.of())
                .build());
    assertThat(search).isNotNull();
    assertThat(CustomerOrders.SEEN.get("findAll")).isEqualTo("7");
  }

  @Test
  void theMastersIdIsTheListingsFixedScopeNotARemovableFilter() {
    var listing =
        load(
            "/_mdt/customers/7/orders",
            "/_mdt/customers/7/orders",
            CustomerOrders.class,
            Map.of("_route", "", "_componentRoute", "/_mdt/customers/7/orders"));
    var filters = new ArrayList<io.mateu.dtos.FormFieldDto>();
    collect(listing, io.mateu.dtos.CrudlDto.class)
        .forEach(crudl -> filters.addAll(crudl.filters()));
    assertThat(filters).extracting(io.mateu.dtos.FormFieldDto::fieldId).contains("customerId");
    assertThat(filters)
        .filteredOn(f -> "customerId".equals(f.fieldId()))
        .allMatch(io.mateu.dtos.FormFieldDto::readOnly);
    // the tab already reads "Orders": the listing does not say it again
    assertThat(collect(listing, io.mateu.dtos.CrudlDto.class))
        .extracting(io.mateu.dtos.CrudlDto::title)
        .containsOnlyNulls();
  }

  private static <T> List<T> collect(Object node, Class<T> type) {
    var out = new ArrayList<T>();
    collectInto(node, type, out, new java.util.IdentityHashMap<>());
    return out;
  }

  private static <T> void collectInto(
      Object node, Class<T> type, List<T> out, java.util.IdentityHashMap<Object, Boolean> seen) {
    if (node == null || seen.put(node, true) != null) {
      return;
    }
    if (type.isInstance(node)) {
      out.add(type.cast(node));
    }
    if (node instanceof Iterable<?> it) {
      it.forEach(child -> collectInto(child, type, out, seen));
      return;
    }
    if (node instanceof Map<?, ?> map) {
      map.values().forEach(child -> collectInto(child, type, out, seen));
      return;
    }
    if (node.getClass().isRecord()) {
      for (var component : node.getClass().getRecordComponents()) {
        try {
          collectInto(component.getAccessor().invoke(node), type, out, seen);
        } catch (Exception ignored) {
          // skip
        }
      }
    }
  }

  @Test
  void theNewFormOfATabsCrudStartsWithTheMastersId() {
    var form =
        mateu.run(
            RunActionRqDto.builder()
                .route("/_mdt/customers/7/orders/new")
                .consumedRoute("/_mdt/customers/7/orders")
                .serverSideType(CustomerOrders.class.getName())
                .actionId("")
                .initiatorComponentId("ux")
                .componentState(
                    Map.of("_route", "/new", "_componentRoute", "/_mdt/customers/7/orders"))
                .parameters(Map.of())
                .build());
    var states = new ArrayList<Object>();
    form.fragments().forEach(fragment -> states.add(fragment.state()));
    assertThat(states)
        .anySatisfy(state -> assertThat(((Map<?, ?>) state).get("customerId")).isEqualTo("7"));
  }

  @Test
  void aRowOfTheListingOpensTheMastersRoute() {
    var listing =
        load(
            "/_mdt/customers",
            "/_mdt/customers",
            Customers.class,
            Map.of("_route", "", "_componentRoute", "/_mdt/customers"));
    assertThat(collect(listing, io.mateu.dtos.CrudlDto.class))
        .extracting(io.mateu.dtos.CrudlDto::rowRoute)
        .containsExactly("/_mdt/customers/${row.id}");
  }

  @Test
  void aCrudInsideATabPushesItsRoutesUnderTheTab() {
    var view =
        mateu.run(
            RunActionRqDto.builder()
                .route("/_mdt/customers/7/orders")
                .consumedRoute("/_mdt/customers/7/orders")
                .serverSideType(CustomerOrders.class.getName())
                .actionId("new")
                .initiatorComponentId("ux")
                .componentState(
                    Map.of(
                        "_route", "/list",
                        "_componentRoute", "/_mdt/customers/7/orders",
                        "_componentRouteEstablished", true))
                .parameters(Map.of())
                .build());
    assertThat(pushedPath(view)).isEqualTo("/_mdt/customers/7/orders/new");
  }

  @Test
  void aNewRecordCreatedInsideATabBelongsToTheMasterAndLandsUnderTheTab() {
    // what the browser sends from the New form of a tab's crud: the master's consumed route, and
    // the FORM's state — the entity, whose own customerId is still empty
    var state = new HashMap<String, Object>();
    state.put("id", null);
    state.put("customerId", null);
    state.put("status", "OPEN");
    var saved =
        mateu.run(
            RunActionRqDto.builder()
                .route("/_mdt/customers/7/orders/new")
                .consumedRoute("/_mdt/customers/7")
                .serverSideType(CustomerOrders.class.getName())
                .actionId("create")
                .initiatorComponentId("ux")
                .componentState(state)
                .parameters(Map.of())
                .build());
    var created =
        ORDERS.stream().filter(o -> !List.of("7-1", "7-2", "8-1").contains(o.id)).findFirst();
    assertThat(created).isPresent();
    assertThat(created.get().customerId)
        .as("the route's :customerId, not the form's empty field")
        .isEqualTo("7");
    assertThat(pushedPath(saved))
        .as("the record is under the tab, not under the master")
        .isEqualTo("/_mdt/customers/7/orders/" + created.get().id);
  }

  private static String pushedPath(UIIncrementDto increment) {
    if (increment.commands() == null) {
      return null;
    }
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.PushStateToHistory)
        .map(c -> String.valueOf(c.data()))
        .findFirst()
        .orElse(null);
  }
}
