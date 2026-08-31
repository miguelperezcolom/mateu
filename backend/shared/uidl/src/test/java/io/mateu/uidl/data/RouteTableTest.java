package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The mount's route registry: matching (static before parameterised, order-independent), the merge
 * of an authored table over the derived one, and the parameter precedence — defaults, then the
 * request, then the entry's fixed parameters, which win.
 */
class RouteTableTest {

  private static final RouteEntry ROOT = RouteEntry.of("", "com.acme.Home");
  private static final RouteEntry NEW_ORDER = RouteEntry.of("orders/new", "com.acme.NewOrder");
  private static final RouteEntry ORDER = RouteEntry.of("orders/:id", "com.acme.OrderDetail");

  private static final RouteTable TABLE = new RouteTable(List.of(ORDER, NEW_ORDER, ROOT));

  @Test
  void theRootOfTheMountIsTheEmptyRoute() {
    assertThat(TABLE.match("").orElseThrow().entry()).isEqualTo(ROOT);
    assertThat(TABLE.match("/").orElseThrow().entry()).isEqualTo(ROOT);
  }

  @Test
  void aStaticRouteIsNotSwallowedByAParameterisedOneDeclaredBeforeIt() {
    // `orders/:id` is declared FIRST in the table on purpose: matching must not depend on order.
    assertThat(TABLE.match("orders/new").orElseThrow().entry()).isEqualTo(NEW_ORDER);
  }

  @Test
  void aParameterisedRouteReadsItsParamsOffThePath() {
    var match = TABLE.match("orders/42").orElseThrow();
    assertThat(match.entry()).isEqualTo(ORDER);
    assertThat(match.pathParams()).containsExactly(Map.entry("id", "42"));
  }

  @Test
  void aPathThatMatchesNothingResolvesToNothing() {
    assertThat(TABLE.match("orders/42/lines")).isEmpty();
    assertThat(TABLE.match("customers")).isEmpty();
  }

  @Test
  void pathParamsAreListedInDeclarationOrder() {
    assertThat(RouteEntry.of("orders/:orderId/lines/:lineId", "X").pathParams())
        .containsExactly("orderId", "lineId");
  }

  @Test
  void anAuthoredEntryReplacesTheDerivedOneForTheSameRoute() {
    var derived = new RouteTable(List.of(ROOT, RouteEntry.of("orders/:id", "com.acme.Generated")));
    var authored = new RouteTable(List.of(ORDER));

    var merged = authored.mergedOver(derived);

    assertThat(merged.routes()).hasSize(2);
    assertThat(merged.match("orders/7").orElseThrow().entry().viewModel())
        .isEqualTo("com.acme.OrderDetail");
  }

  @Test
  void theMergeKeepsDerivedEntriesTheAuthoredTableDoesNotMention() {
    var derived = new RouteTable(List.of(ROOT, NEW_ORDER));
    var merged = new RouteTable(List.of(ORDER)).mergedOver(derived);

    assertThat(merged.routes()).contains(ROOT, NEW_ORDER, ORDER);
  }

  @Test
  void fixedParamsWinOverThePathAndOverTheIncomingRequest() {
    var pinned =
        new RouteEntry(
            "orders/:id", null, "com.acme.OrderDetail", Map.of("status", "pending"), null);
    var match = new RouteTable(List.of(pinned)).match("orders/42").orElseThrow();

    // The request tries to widen the scope it was pinned to; the entry wins.
    var params = match.params(Map.of("status", "all", "page", 2));

    assertThat(params).containsEntry("status", "pending");
    assertThat(params).containsEntry("id", "42");
    assertThat(params).containsEntry("page", 2);
  }

  @Test
  void defaultParamsSeedTheRequestButYieldToIt() {
    var seeded =
        new RouteEntry(
            "orders", null, "com.acme.Orders", null, Map.of("status", "pending", "page", 1));
    var match = new RouteTable(List.of(seeded)).match("orders").orElseThrow();

    var params = match.params(Map.of("status", "archived"));

    assertThat(params).containsEntry("status", "archived");
    assertThat(params).containsEntry("page", 1);
  }

  @Test
  void aRouteWithNoViewModelIsValid() {
    // A statically deployed route: a definition, client-side data, and no server behind it.
    var staticOnly = new RouteEntry("about", "about.yaml", null, null, null);
    assertThat(new RouteTable(List.of(staticOnly)).match("about")).isPresent();
    assertThat(staticOnly.viewModel()).isNull();
  }
}
