package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The route registry reads {@code specs/ui/routes.yaml} (see the fixture in test resources) and
 * merges it over the table the annotation processors derive, with the authored entry winning.
 */
class RouteRegistryTest {

  private final RouteRegistry registry = new RouteRegistry();

  private RouteTable authored() {
    return registry.authoredFrom(getClass().getClassLoader());
  }

  @Test
  void theAuthoredTableIsReadFromTheYamlNextToTheDefinitions() {
    assertThat(authored().routes()).extracting(RouteEntry::route).contains("orders", "about");
  }

  @Test
  void twoRoutesCanShareOneScreenAndBeToldApartByAPinnedParameter() {
    var table = authored();

    var pending = table.match("orders/pending").orElseThrow();
    var archived = table.match("orders/archived").orElseThrow();

    assertThat(pending.entry().viewModel()).isEqualTo("com.acme.Orders");
    assertThat(archived.entry().viewModel()).isEqualTo("com.acme.Orders");
    assertThat(pending.params(Map.of())).containsEntry("status", "pending");
    assertThat(archived.params(Map.of())).containsEntry("status", "archived");
  }

  @Test
  void aPinnedParameterIsNotOverridableByTheRequest() {
    // The server re-applies the entry's fixed params instead of trusting what came back from the
    // client, so widening the scope via the query string does not work.
    var params = authored().match("orders/pending").orElseThrow().params(Map.of("status", "all"));
    assertThat(params).containsEntry("status", "pending");
  }

  @Test
  void aSeededParameterIsOverridableByTheRequest() {
    var match = authored().match("orders").orElseThrow();
    assertThat(match.params(Map.of())).containsEntry("status", "open").containsEntry("page", 1);
    assertThat(match.params(Map.of("status", "closed"))).containsEntry("status", "closed");
  }

  @Test
  void aRouteCanHaveADefinitionAndNoViewModel() {
    var about = authored().match("about").orElseThrow().entry();
    assertThat(about.definition()).isEqualTo("about.yaml");
    assertThat(about.viewModel()).isNull();
  }

  @Test
  void aStaticRouteIsNotSwallowedByItsParameterisedSibling() {
    assertThat(authored().match("orders/new").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.NewOrder");
    assertThat(authored().match("orders/42").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.OrderDetail");
  }

  @Test
  void leadingAndTrailingSlashesCarryNoMeaningBecauseRoutesAreRelativeToTheMount() {
    var loaded = registry.load(getClass().getClassLoader());
    assertThat(loaded.match("/orders/pending")).isPresent();
    assertThat(loaded.match("orders/pending/")).isPresent();
  }

  @Test
  void theAuthoredEntryWinsOverTheDerivedOneForTheSameRoute() {
    var derived = new RouteTable(List.of(RouteEntry.of("orders", "com.acme.Generated")));
    var merged = authored().mergedOver(derived);

    assertThat(merged.match("orders").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.Orders");
  }

  @Test
  void derivedEntriesTheYamlDoesNotMentionSurviveTheMerge() {
    var derived = new RouteTable(List.of(RouteEntry.of("customers", "com.acme.Customers")));
    var merged = authored().mergedOver(derived);

    assertThat(merged.match("customers").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.Customers");
  }

  @Test
  void aMissingRoutesYamlIsAnEmptyTableRatherThanAFailure() {
    var emptyClassLoader = new ClassLoader(null) {};
    assertThat(registry.authoredFrom(emptyClassLoader).routes()).isEmpty();
  }

  @Test
  void aStandaloneTypeRoutesFilePrefixesItsEntriesWithTheDeclaredBasePath() {
    // shop-routes.yaml declares `type: Routes` + `basePath: /shop`, so a class-declared
    // @UI("/shop") mount authors its inner routes relatively and they resolve absolutely.
    var table = authored();

    assertThat(table.match("shop/products").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.Products");
    var detail = table.match("shop/products/7").orElseThrow();
    assertThat(detail.entry().viewModel()).isEqualTo("com.acme.ProductDetail");
    assertThat(detail.pathParams()).containsEntry("id", "7");
    // The bare relative route is NOT exposed unprefixed.
    assertThat(table.match("products")).isEmpty();
  }

  @Test
  void nestedChildrenFlattenToAbsoluteRoutesThatFillTheParentSlot() {
    // dashboard declares a `children` sub-route; it composes to /shop/dashboard/sales and carries
    // the parent's absolute route, so the sub-route renders into the dashboard's slot.
    var table = authored();

    var sales = table.match("shop/dashboard/sales").orElseThrow().entry();
    assertThat(sales.viewModel()).isEqualTo("com.acme.SalesPanel");
    assertThat(sales.hasParent()).isTrue();
    assertThat(sales.parent()).isEqualTo("shop/dashboard");

    // The parent itself is a plain top-level entry.
    var dashboard = table.match("shop/dashboard").orElseThrow().entry();
    assertThat(dashboard.viewModel()).isEqualTo("com.acme.ShopDashboard");
    assertThat(dashboard.hasParent()).isFalse();
  }

  @Test
  void aRouteSeedsStateAndAppStateLiteralsAndSourcesDataAndAppDataByRef() {
    var reports = authored().match("shop/reports").orElseThrow().entry();

    assertThat(reports.state()).containsEntry("tab", "summary");
    assertThat(reports.appState()).containsEntry("theme", "dark");
    // data/app-data are references into sources.yaml, never literals — there is no inbound data
    // channel, so the value is always a named source resolved when the route (or app) loads.
    assertThat(reports.data()).isNotNull();
    assertThat(reports.data().ref()).isEqualTo("shop-metrics");
    assertThat(reports.appData().ref()).isEqualTo("shop-catalog");
  }
}
