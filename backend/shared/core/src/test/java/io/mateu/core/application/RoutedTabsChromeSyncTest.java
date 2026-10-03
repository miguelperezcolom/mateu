package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.BackLink;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.FeatureFlags;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The chrome around routed tabs: in-page tabs that are URLs ({@code @Tab(key)}), tabs a feature
 * flag hides ({@code show}), the OCI-style "← Parent" link ({@code @App(backLink = PARENT)}).
 */
class RoutedTabsChromeSyncTest {

  /** A detail page whose in-page tabs are URLs: /_vcn/7/gateways opens Gateways. */
  public static class VcnPage {
    public String id;

    @Tab(value = "Subnets", key = "subnets")
    public String subnetsNote = "subnets";

    @Tab(value = "Gateways", key = "gateways")
    public String gatewaysNote = "gateways";

    @Tab(value = "Simulator", key = "simulator", show = "simulator")
    public String simulatorNote = "simulator";
  }

  /** A page whose flags leave one tab: it keeps its key, its strip is the renderers' to drop. */
  public static class PoliciesPage {
    @Tab(value = "Policies", key = "all-policies")
    public String policies = "p";

    @Tab(value = "Simulator", key = "simulator", show = "simulator")
    public String simulator = "s";
  }

  @Title("Customers")
  public static class CustomersList {
    public String filter;
  }

  @Title("Orders")
  public static class OrdersTab {
    public String customerId;
    public String note = "orders";
  }

  @App(value = AppVariant.TABS, backLink = BackLink.PARENT)
  public static class CustomerMaster {
    public String customerId;
  }

  @App(AppVariant.TABS)
  public static class PlainMaster {
    public String customerId;
  }

  public static class Routes implements RouteEntrySupplier {
    @Override
    public List<RouteEntry> routes() {
      return List.of(
          RouteEntry.of("_vcn/:id", VcnPage.class.getName()),
          RouteEntry.of("_policies", PoliciesPage.class.getName()),
          RouteEntry.of("_bl/customers", CustomersList.class.getName()),
          new RouteEntry(
              "_bl/customers/:customerId",
              null,
              CustomerMaster.class.getName(),
              null,
              null,
              null,
              List.of(RouteEntry.of("orders", OrdersTab.class.getName()))),
          new RouteEntry(
              "_bl/plain/:customerId",
              null,
              PlainMaster.class.getName(),
              null,
              null,
              null,
              List.of(RouteEntry.of("orders", OrdersTab.class.getName()))));
    }
  }

  /** `simulator` is off in this deployment. */
  public static class Flags implements FeatureFlags {
    @Override
    public Boolean isEnabled(String flag, HttpRequest httpRequest) {
      return "simulator".equals(flag) ? Boolean.FALSE : null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Routes(), new Flags()));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto load(String route, String consumedRoute, Class<?> type) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumedRoute)
            .serverSideType(type == null ? null : type.getName())
            .actionId("")
            .initiatorComponentId("ux")
            .componentState(Map.of())
            .parameters(Map.of())
            .build());
  }

  private static List<TabDto> tabsOf(UIIncrementDto increment) {
    var out = new ArrayList<TabDto>();
    walk(
        increment,
        node -> {
          if (node instanceof ClientSideComponentDto c && c.metadata() instanceof TabDto tab) {
            out.add(tab);
          }
        });
    return out;
  }

  private static <T> List<T> all(UIIncrementDto increment, Class<T> type) {
    var out = new ArrayList<T>();
    walk(
        increment,
        node -> {
          if (type.isInstance(node)) {
            out.add(type.cast(node));
          }
        });
    return out;
  }

  private static void walk(Object node, java.util.function.Consumer<Object> visitor) {
    walk(node, visitor, new IdentityHashMap<>());
  }

  private static void walk(
      Object node,
      java.util.function.Consumer<Object> visitor,
      IdentityHashMap<Object, Boolean> seen) {
    if (node == null || seen.put(node, true) != null) {
      return;
    }
    visitor.accept(node);
    if (node instanceof Iterable<?> it) {
      it.forEach(child -> walk(child, visitor, seen));
    } else if (node instanceof Map<?, ?> map) {
      map.values().forEach(child -> walk(child, visitor, seen));
    } else if (node.getClass().isRecord()) {
      for (var component : node.getClass().getRecordComponents()) {
        try {
          walk(component.getAccessor().invoke(node), visitor, seen);
        } catch (Exception ignored) {
          // skip
        }
      }
    }
  }

  @Test
  void aTabWithAKeyCarriesItAsItsRouteKey() {
    var tabs = tabsOf(mateu.sync("/_vcn/7"));
    assertThat(tabs).extracting(TabDto::routeKey).containsExactly("subnets", "gateways");
  }

  @Test
  void theUrlEndingInATabsKeyOpensThatTab() {
    var tabs = tabsOf(mateu.sync("/_vcn/7/gateways"));
    assertThat(tabs)
        .filteredOn(TabDto::active)
        .extracting(TabDto::routeKey)
        .containsExactly("gateways");
  }

  @Test
  void aTabWhoseFlagIsOffIsNotOffered() {
    var tabs = tabsOf(mateu.sync("/_vcn/7"));
    assertThat(tabs).extracting(TabDto::label).doesNotContain("Simulator");
  }

  @Test
  void aSingleVisibleTabKeepsItsKey() {
    var tabs = tabsOf(mateu.sync("/_policies"));
    assertThat(tabs).hasSize(1);
    assertThat(tabs.get(0).routeKey()).isEqualTo("all-policies");
  }

  @Test
  void backLinkParentPointsAtTheNearestScreenAboveWithItsTitle() {
    var app = all(load("/_bl/customers/7", "", CustomerMaster.class), AppDto.class).get(0);
    assertThat(app.backRoute()).isEqualTo("/_bl/customers");
    assertThat(app.backLabel()).isEqualTo("Customers");
    assertThat(app.noBreadcrumbs()).isTrue();
  }

  @Test
  void thePagesInsideABackLinkMasterCarryNoTrail() {
    var pages =
        all(load("/_bl/customers/7/orders", "/_bl/customers/7", OrdersTab.class), PageDto.class);
    assertThat(pages).isNotEmpty().allMatch(page -> Boolean.TRUE.equals(page.noBreadcrumbs()));
  }

  @Test
  void anAppWithoutBackLinkKeepsItsBreadcrumbs() {
    var app = all(load("/_bl/plain/7", "", PlainMaster.class), AppDto.class).get(0);
    assertThat(app.backRoute()).isNull();
    var pages = all(load("/_bl/plain/7/orders", "/_bl/plain/7", OrdersTab.class), PageDto.class);
    assertThat(pages).noneMatch(page -> Boolean.TRUE.equals(page.noBreadcrumbs()));
  }

  @Test
  void aTabsOwnPageDoesNotRepeatTheTabLabel() {
    var pages = all(load("/_bl/plain/7/orders", "/_bl/plain/7", OrdersTab.class), PageDto.class);
    assertThat(pages).extracting(PageDto::title).doesNotContain("Orders");
  }
}
