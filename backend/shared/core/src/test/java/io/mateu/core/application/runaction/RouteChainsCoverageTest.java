package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.BackLink;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.di.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collection;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * What {@code parent}/{@code children}, {@code defaultChild}, {@code access:} and a mount's {@code
 * home} mean at runtime, read off a {@code type: UI} mount with nested routes (written to a temp
 * classpath, so the shared test specs are untouched): the chain a nested route renders through,
 * which level is still pending under what an enclosing app consumed, which tab opens by default,
 * which entry refuses a caller, and the title a tab page must not repeat.
 */
class RouteChainsCoverageTest {

  @App
  @Title("Customer")
  public static class CustomerMaster {}

  @App(backLink = BackLink.PARENT)
  @Title("Report")
  public static class ReportMaster {}

  @Title("Orders")
  public static class CustomerOrders {
    String customerId;
    String status;
  }

  public static class CustomerNotes {}

  public static class PlainPage {}

  private static final String NESTED = RouteChainsCoverageTest.class.getName() + "$";

  /** Serves {@code specs/ui/**} from the temp dir; classes from the test class path. */
  static final class SpecsOverlay extends ClassLoader {
    private final URLClassLoader specs;

    SpecsOverlay(Path root, ClassLoader parent) throws IOException {
      super(parent);
      this.specs = new URLClassLoader(new URL[] {root.toUri().toURL()}, null);
    }

    private static boolean isSpec(String name) {
      return name.startsWith("specs/ui") || name.startsWith("/specs/ui");
    }

    @Override
    public URL getResource(String name) {
      return isSpec(name) ? specs.getResource(name) : super.getResource(name);
    }

    @Override
    public Enumeration<URL> getResources(String name) throws IOException {
      return isSpec(name) ? specs.getResources(name) : super.getResources(name);
    }
  }

  private ClassLoader previousLoader;
  private RouteRegistry registry;
  private Object previousProvider;

  @BeforeEach
  void mount() throws Exception {
    var root = Files.createTempDirectory("route-chains");
    var ui = Files.createDirectories(root.resolve("specs/ui"));
    Files.writeString(
        ui.resolve("crm.ui.yaml"),
        """
        type: UI
        basePath: /crm
        home: dashboard
        routes: crm-routes.yaml
        """);
    Files.writeString(
        ui.resolve("crm-routes.yaml"),
        """
        routes:
          - route: dashboard
            viewModel: %1$sPlainPage
            state:
              tab: summary
          - route: customers/:customerId
            viewModel: %1$sCustomerMaster
            defaultChild: notes
            children:
              - route: orders
                viewModel: %1$sCustomerOrders
                access: [sales]
              - route: notes
                viewModel: %1$sCustomerNotes
          - route: reports
            viewModel: %1$sReportMaster
            defaultChild: missing
            children:
              - route: weekly
                show: "!weekly-off"
              - route: monthly
          - route: pages/:id
            viewModel: %1$sPlainPage
            children:
              - route: detail
                viewModel: %1$sPlainPage
          - route: feeds
            data: shop-metrics
            appData:
              ref: catalog
              url: /api/catalog
              method: GET
              itemsPath: items
              proxy: true
        """
            .formatted(NESTED));
    previousLoader = Thread.currentThread().getContextClassLoader();
    Thread.currentThread()
        .setContextClassLoader(
            new SpecsOverlay(root, RouteChainsCoverageTest.class.getClassLoader()));
    registry = new RouteRegistry();
    var field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    previousProvider = field.get(null);
    var self = registry;
    MateuBeanProvider.setBeanProvider(
        new BeanProvider() {
          @Override
          @SuppressWarnings("unchecked")
          public <T> T getBean(Class<T> clazz) {
            return clazz == RouteRegistry.class ? (T) self : null;
          }

          @Override
          public <T> Collection<T> getBeans(Class<T> clazz) {
            return List.of();
          }
        });
  }

  @AfterEach
  void unmount() throws Exception {
    Thread.currentThread().setContextClassLoader(previousLoader);
    var field = MateuBeanProvider.class.getDeclaredField("beanProvider");
    field.setAccessible(true);
    field.set(null, previousProvider);
  }

  private static FakeHttpRequest request(String route) {
    return new FakeHttpRequest(RunActionRqDto.builder().route(route).actionId("").build())
        .withAttribute("baseUrl", "");
  }

  // ── RouteRegistry ─────────────────────────────────────────────────────────

  @Test
  void aChildRouteIsTheMasterThenTheChildWithThePathParametersOfEachLevel() {
    var chain = registry.chain("/crm/customers/7/orders");
    assertThat(chain)
        .extracting(RouteRegistry.ChainLink::path)
        .containsExactly("/crm/customers/7", "/crm/customers/7/orders");
    assertThat(chain.get(0).pathParams()).containsEntry("customerId", "7");
  }

  @Test
  void pastAChildRouteThePathIsTheChildsOwnBusiness() {
    // a record of the orders crud: the leaf is still the orders tab
    var chain = registry.chain("/crm/customers/7/orders/42?tab=1");
    assertThat(chain)
        .extracting(link -> link.entry().route())
        .containsExactly("crm/customers/:customerId", "crm/customers/:customerId/orders");
    assertThat(chain.get(1).path()).isEqualTo("/crm/customers/7/orders");
  }

  @Test
  void pastATopLevelRouteThereIsNoChainAndUnknownPathsHaveNone() {
    assertThat(registry.chain("/crm/dashboard/extra")).isEmpty();
    assertThat(registry.chain("/nowhere/at/all")).isEmpty();
  }

  @Test
  void thePendingLevelIsTheOutermostOneBeyondWhatTheEnclosingAppConsumed() {
    assertThat(registry.outermostPending("/crm/customers/7/orders", "_empty"))
        .get()
        .extracting(RouteRegistry.ChainLink::path)
        .isEqualTo("/crm/customers/7");
    assertThat(registry.outermostPending("/crm/customers/7/orders", "/crm/customers/7"))
        .get()
        .extracting(RouteRegistry.ChainLink::path)
        .isEqualTo("/crm/customers/7/orders");
    assertThat(registry.outermostPending("/crm/customers/7/orders", "/crm/customers/7/orders"))
        .isEmpty();
  }

  @Test
  void theNamedDefaultChildOpensAndAnUnknownNameFallsBackToTheFirstChild() {
    assertThat(registry.defaultChildOf("crm/customers/:customerId"))
        .get()
        .extracting(RouteEntry::route)
        .isEqualTo("crm/customers/:customerId/notes");
    assertThat(registry.defaultChildOf("crm/reports"))
        .get()
        .extracting(RouteEntry::route)
        .isEqualTo("crm/reports/weekly");
    assertThat(registry.defaultChildOf("crm/dashboard")).isEmpty();
  }

  @Test
  void theDefaultChildPathIsConcreteUnderTheRequestedMaster() {
    assertThat(registry.defaultChildPath("/crm/customers/7")).contains("/crm/customers/7/notes");
    assertThat(registry.defaultChildPath("/crm/dashboard")).isEmpty();
    assertThat(registry.defaultChildPath("/nowhere")).isEmpty();
  }

  @Test
  void aRestrictedChildRefusesACallerWithoutTheRoleAlsoOnItsSubRoutes() {
    var anonymous = request("/crm/customers/7/orders");
    assertThat(registry.refusingEntry("crm/customers/7/orders", anonymous))
        .extracting(RouteEntry::route)
        .isEqualTo("crm/customers/:customerId/orders");
    assertThat(registry.isReachable("crm/customers/7/orders/new", anonymous)).isFalse();
    assertThat(registry.isReachable("crm/customers/7/notes", anonymous)).isTrue();
    assertThat(registry.isReachable("crm/unknown/path", anonymous)).isTrue();

    var sales = request("/crm/customers/7/orders");
    sales.withPrincipal(TestIdentities.principalWithRoles("sales"));
    assertThat(registry.isReachable("crm/customers/7/orders", sales)).isTrue();
  }

  @Test
  void theMountRootBecomesTheHomeAndTheHomeIsKnownForAnyRouteOfTheMount() {
    var root = registry.authored().match("crm").orElseThrow().entry();
    assertThat(root.viewModel()).isEqualTo(NESTED + "PlainPage");
    assertThat(root.state()).containsEntry("tab", "summary");
    assertThat(registry.mountHomeFor("/crm/customers/7")).isEqualTo("dashboard");
    assertThat(registry.mountHomes()).containsEntry("crm", "dashboard");
    assertThat(registry.mountHomeFor("/elsewhere")).isNull();
  }

  @Test
  void dataSourcesAreReadAsAReferenceOrAnInlineEndpoint() {
    var feeds = registry.authored().match("crm/feeds").orElseThrow().entry();
    assertThat(feeds.data().ref()).isEqualTo("shop-metrics");
    assertThat(feeds.appData().ref()).isEqualTo("catalog");
    assertThat(feeds.appData().url()).isEqualTo("/api/catalog");
    assertThat(feeds.appData().itemsPath()).isEqualTo("items");
    assertThat(feeds.appData().proxy()).isTrue();
  }

  @Test
  void theDslMountIsAnnouncedAsAnAppWithNoClass() {
    assertThat(registry.apps())
        .filteredOn(app -> app.route().equals("crm"))
        .singleElement()
        .satisfies(app -> assertThat(app.isDsl()).isTrue());
  }

  // ── RouteChains (the static helpers mappers use) ──────────────────────────

  @Test
  void aDeepLinkToATabIsRenderedByTheMasterAppPendingAboveIt() {
    assertThat(RouteChains.pendingAppAncestor("/crm/customers/7/orders", "_empty"))
        .get()
        .extracting(RouteRegistry.ChainLink::path)
        .isEqualTo("/crm/customers/7");
    assertThat(RouteChains.screenFor("/crm/customers/7/orders", "_empty"))
        .isEqualTo(NESTED + "CustomerMaster");
  }

  @Test
  void aParentThatIsNotAnAppHasNoSlotSoTheChildResolvesAlone() {
    assertThat(RouteChains.pendingAppAncestor("/crm/pages/3/detail", "_empty")).isEmpty();
  }

  @Test
  void aRecordInsideATabIsTheTabsListingToResolve() {
    assertThat(RouteChains.screenFor("/crm/customers/7/orders/7-2", "/crm/customers/7"))
        .isEqualTo(NESTED + "CustomerOrders");
    // the tab's own route, consumed by the master: nothing for the chain to say
    assertThat(RouteChains.screenFor("/crm/customers/7/orders", "/crm/customers/7")).isNull();
    assertThat(RouteChains.screenFor("/crm/dashboard", "_empty")).isNull();
  }

  @Test
  void aNewChildRecordStartsWithTheMastersIdItHasAFieldFor() {
    var values =
        RouteChains.scopeValuesFor(CustomerOrders.class, request("/crm/customers/7/orders/new"));
    assertThat(values).containsExactly(Map.entry("customerId", "7"));
    assertThat(RouteChains.scopeValuesFor(CustomerOrders.class, request("/crm/dashboard")))
        .isEmpty();
  }

  @Test
  void aTabPageDoesNotRepeatItsTabLabelOrItsMastersTitle() {
    var tabPage = request("/crm/customers/7/orders");
    assertThat(RouteChains.dedupeTitle("Orders", tabPage)).isNull();
    assertThat(RouteChains.dedupeTitle("Customer", tabPage)).isNull();
    assertThat(RouteChains.dedupeTitle("Open orders", tabPage)).isEqualTo("Open orders");
    // a record inside the tab keeps its own title
    assertThat(RouteChains.dedupeTitle("Orders", request("/crm/customers/7/orders/9")))
        .isEqualTo("Orders");
    // a page outside any chain
    assertThat(RouteChains.dedupeTitle("Dashboard", request("/crm/dashboard")))
        .isEqualTo("Dashboard");
  }

  @Test
  void aTabIsLabelledByItsTitleElseByItsSegment() {
    var orders = registry.authored().match("crm/customers/7/orders").orElseThrow().entry();
    assertThat(RouteChains.tabLabel(orders, "/orders")).isEqualTo("Orders");
    var monthly = registry.authored().match("crm/reports/monthly").orElseThrow().entry();
    assertThat(RouteChains.tabLabel(monthly, "/monthly-sales")).isEqualTo("Monthly sales");
  }

  @Test
  void pagesUnderABackLinkAppShowNoBreadcrumbs() {
    assertThat(RouteChains.insideBackLinkApp(request("/crm/reports/weekly"))).isTrue();
    assertThat(RouteChains.insideBackLinkApp(request("/crm/customers/7/orders"))).isFalse();
    assertThat(RouteChains.insideBackLinkApp(null)).isFalse();
  }

  @Test
  void theDefaultTabIsTheNamedOneAmongTheVisibleChildren() {
    assertThat(RouteChains.defaultChildPath("/crm/customers/7", request("/crm/customers/7")))
        .isEqualTo("/crm/customers/7/notes");
    assertThat(RouteChains.childrenOf("/crm/customers/7"))
        .extracting(RouteChains.ChildRoute::relative, RouteChains.ChildRoute::path)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("/orders", "/crm/customers/7/orders"),
            org.assertj.core.groups.Tuple.tuple("/notes", "/crm/customers/7/notes"));
    // the orders tab is restricted to sales: an anonymous caller does not see it
    assertThat(RouteChains.visibleChildrenOf("/crm/customers/7", request("/crm/customers/7")))
        .extracting(RouteChains.ChildRoute::relative)
        .containsExactly("/notes");
    assertThat(RouteChains.defaultChildPath("/crm/dashboard")).isNull();
    assertThat(RouteChains.childrenOf("/nowhere")).isEmpty();
  }

  @Test
  void aClassMountedNonRootAsksWithRelativeRoutesAndGetsRelativePathsBack() {
    // the browser on /crm/customers/7/orders posts route=/customers/7/orders to the /crm mount
    var mounted = request("/customers/7/orders").withAttribute("baseUrl", "/crm");
    assertThat(RouteChains.chainOf("/customers/7/orders", mounted))
        .extracting(RouteRegistry.ChainLink::path)
        .containsExactly("/customers/7", "/customers/7/orders");
    assertThat(RouteChains.pendingAppAncestor("/customers/7/orders", "/customers/7", mounted))
        .isEmpty();
    assertThat(RouteChains.pendingAppAncestor("/customers/7/orders", "_empty", mounted))
        .get()
        .extracting(RouteRegistry.ChainLink::path)
        .isEqualTo("/customers/7");
  }
}
