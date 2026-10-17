package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.RouteLink;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Where a route-typed menu entry sends the content load: the route the entry NAMES (not the menu
 * path it was reached by), read relative to the mount the request was sent to, keeping whatever the
 * request carries below the entry (a record id, a query).
 */
class MenuEntryTargetTest {

  private static RunActionCommand command(String route, String entryPath, String baseUrl) {
    var request = new FakeHttpRequest(RunActionRqDto.builder().route(route).build());
    if (entryPath != null) {
      request.withAttribute("resolvedPath", entryPath);
    }
    return new RunActionCommand(
        baseUrl, null, route, "", "", Map.of(), Map.of(), null, request, null, null);
  }

  private static String target(String entryRoute, String route, String entryPath, String baseUrl) {
    return ActionableDispatcher.targetOf(
        new RouteLink(entryRoute, "Entry"), command(route, entryPath, baseUrl));
  }

  @Test
  void theEntryGoesWhereItsRouteSaysKeepingTheRecordBelowIt() {
    assertThat(target("/orders-v2", "/orders/5?tab=2", "/orders", ""))
        .isEqualTo("/orders-v2/5?tab=2");
    assertThat(target("/orders-v2", "/orders", "/orders", "")).isEqualTo("/orders-v2");
  }

  @Test
  void aRouteNamingTheMountItIsServedFromIsReadRelativeToIt() {
    assertThat(target("/e2-demo/other", "/other", "/other", "/e2-demo")).isEqualTo("/other");
    assertThat(target("/e2-demo/other", "/other", "/other", "/e2-demo/")).isEqualTo("/other");
    assertThat(target("/e2-demo", "/home", "/home", "/e2-demo")).isEqualTo("");
    // another mount's route stays absolute
    assertThat(target("/billing/x", "/other", "/other", "/e2-demo")).isEqualTo("/billing/x");
    // a remote base url is not a mount of this server
    assertThat(target("/e2-demo/other", "/other", "/other", "http://remote/e2-demo"))
        .isEqualTo("/e2-demo/other");
  }

  @Test
  void theRequestsOwnRouteIsKeptWhenTheEntryNamesNoInAppRoute() {
    assertThat(target("https://mateu.io/docs", "/docs", "/docs", "")).isEqualTo("/docs");
    assertThat(target("//cdn/x", "/docs", "/docs", "")).isEqualTo("/docs");
    // not known which part of the request the entry consumed
    assertThat(target("/orders-v2", "/orders/5", null, "")).isEqualTo("/orders/5");
    assertThat(target("/orders-v2", "/elsewhere", "/orders", "")).isEqualTo("/elsewhere");
    // a longer segment that merely starts like the entry is not below it
    assertThat(target("/orders-v2", "/ordersArchive", "/orders", "")).isEqualTo("/ordersArchive");
  }

  @Test
  void aRemoteClaimsTheRoutesUnderItsMountPrefixWhateverTheSlashes() {
    var billing = new io.mateu.uidl.data.RemoteMenu("/_billing").withPath("billing");
    assertThat(AppMenuResolver.prefixClaim(billing, "billing/invoices")).isEqualTo(8);
    assertThat(AppMenuResolver.prefixClaim(billing, "/billing")).isEqualTo(8);
    assertThat(AppMenuResolver.prefixClaim(billing, "/billingx")).isEqualTo(-1);
    assertThat(AppMenuResolver.prefixClaim(billing, null)).isEqualTo(-1);
    assertThat(AppMenuResolver.prefixClaim(billing.withPath(" "), "/billing")).isEqualTo(-1);
  }
}
