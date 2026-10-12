package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * routes.yaml on a CLASS-declared NON-ROOT mount ({@code @UI("/nrm")} + {@code
 * nonroot-mount-routes.yaml}, {@code basePath: /nrm}), requested the way the browser requests it:
 * served by the mount's own controller (base url {@code /nrm}) with the route RELATIVE to it. Every
 * route of such a file answered "Page not found" (found walking the app shell, 2026-10-12): the
 * table is absolute, the request relative, and only {@code @UI} matching knew about the mount.
 */
class NonRootMountRoutesSyncTest {

  @Title("Orders")
  public static class Orders {
    public String status;
  }

  @App(AppVariant.TABS)
  public static class CustomerMaster implements TitleSupplier {
    public String customerId;

    @Override
    public String title() {
      return "Customer " + customerId;
    }
  }

  @Title("Customer orders")
  public static class CustomerOrders {
    public String customerId;
  }

  @Title("Customer notes")
  public static class CustomerNotes {
    public String customerId;
  }

  @UI("/nrm")
  @Title("Non-root mount")
  @App(AppVariant.MENU_ON_TOP)
  public static class NrmApp {
    @Menu RouteLink pending = new RouteLink("/nrm/orders/pending", "Pending orders");
  }

  static TestMateu mateu;
  static final ObjectMapper json = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(NrmApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** What the browser posts to /nrm/mateu/v3/sync once the shell is on screen. */
  private static UIIncrementDto content(String route, Class<?> type, String consumedRoute) {
    return mateu.runAt(
        "/nrm",
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumedRoute)
            .serverSideType(type.getName())
            .actionId("")
            .initiatorComponentId("ux")
            .componentState(Map.of())
            .parameters(Map.of())
            .build());
  }

  private static String wire(UIIncrementDto increment) throws Exception {
    return json.writeValueAsString(increment);
  }

  @Test
  void aRouteWithAPinnedParamAnswersItsViewModelWithTheParam() throws Exception {
    var wire = wire(content("/orders/pending", NrmApp.class, ""));
    assertThat(wire).doesNotContain("\"NotFound\"").contains(Orders.class.getName());
    assertThat(wire).contains("\"status\":\"pending\"");
  }

  @Test
  void aDefaultParamSeedsTheRoute() throws Exception {
    // (the query overriding it is a browser concern: e2e shell-menu.spec.ts)
    assertThat(wire(content("/orders", NrmApp.class, ""))).contains("\"status\":\"open\"");
  }

  @Test
  void aDeepLinkToARecordMasterRendersTheMasterOnItsDefaultTab() {
    var app =
        FullSyncPipelineTest.findMetadata(
            content("/customers/7", NrmApp.class, "").fragments().get(0).component(), AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.serverSideType()).isEqualTo(CustomerMaster.class.getName());
    assertThat(app.title()).isEqualTo("Customer 7");
    assertThat(app.homeRoute()).isEqualTo("/customers/7/orders");
    assertThat(app.homeServerSideType()).isEqualTo(CustomerOrders.class.getName());
  }

  @Test
  void theMasterGetsItsIdAndOpensItsDefaultTab() {
    var app =
        FullSyncPipelineTest.findMetadata(
            content("/customers/7", CustomerMaster.class, "").fragments().get(0).component(),
            AppDto.class);
    assertThat(app.title()).isEqualTo("Customer 7");
    assertThat(app.homeServerSideType()).isEqualTo(CustomerOrders.class.getName());
    assertThat(app.menu())
        .extracting(o -> o.label())
        .containsExactly("Customer orders", "Customer notes");
  }

  @Test
  void aDeepLinkToATabGoesThroughTheMasterToTheTab() throws Exception {
    var app =
        FullSyncPipelineTest.findMetadata(
            content("/customers/7/notes", CustomerMaster.class, "").fragments().get(0).component(),
            AppDto.class);
    assertThat(app.homeServerSideType()).isEqualTo(CustomerNotes.class.getName());
    var tab = wire(content(app.homeRoute(), CustomerNotes.class, app.homeConsumedRoute()));
    assertThat(tab).contains("\"customerId\":\"7\"");
  }
}
