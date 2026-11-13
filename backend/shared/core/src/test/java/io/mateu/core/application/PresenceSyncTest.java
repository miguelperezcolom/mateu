package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.PresenceDto;
import io.mateu.dtos.PresenceEntryDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Record presence ({@code @App(presence = true)}): who else has a record open, who edits it — only
 * signed-in callers, never across records or apps, and pushed on the live-updates stream to the
 * people on the record only.
 */
class PresenceSyncTest {

  @SuppressWarnings("unused")
  @UI("/presence-desk")
  @App(presence = true)
  public static class Desk {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/presence-other")
  @App(presence = true)
  public static class OtherDesk {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/presence-off")
  @App
  public static class PlainDesk {
    @Menu String home = "/";
  }

  @SuppressWarnings("unused")
  @UI("/orders")
  public static class OrderView {
    String id;
  }

  /** A record view only managers may open. */
  @SuppressWarnings("unused")
  @UI("/payslips")
  @io.mateu.uidl.annotations.EyesOnly(roles = "manager")
  public static class PayslipView {
    String id;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            Desk.class, OtherDesk.class, PlainDesk.class, OrderView.class, PayslipView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** Every test leaves the records it opened: the store is process-wide. */
  private final List<Object[]> opened = new CopyOnWriteArrayList<>();

  @AfterEach
  void leaveEverything() {
    for (var o : opened) {
      presence((Class<?>) o[0], (String) o[1], (String) o[2], (String) o[3], "leave");
    }
    opened.clear();
  }

  @Test
  void theAppSaysWhetherPresenceIsOn() {
    assertThat(app("/presence-desk").presence()).isTrue();
    assertThat(app("/presence-off").presence()).isFalse();
  }

  @Test
  void eachOneSeesTheOthersAndWhoEdits() {
    open(Desk.class, "ana", "tab-a", "orders/7", "viewing");
    open(Desk.class, "bob", "tab-b", "orders/7/edit", "editing");

    var seenByAna = presence(Desk.class, "ana", "tab-a", "orders/7", "viewing");
    assertThat(seenByAna.key()).isEqualTo("orders/7|" + OrderView.class.getName());
    assertThat(seenByAna.entries())
        .extracting(PresenceEntryDto::name, PresenceEntryDto::editing)
        .containsExactly(org.assertj.core.groups.Tuple.tuple("bob", true));
    assertThat(seenByAna.entries().get(0).since()).isNotBlank();

    var seenByBob = presence(Desk.class, "bob", "tab-b", "orders/7/edit", "editing");
    assertThat(seenByBob.entries())
        .extracting(PresenceEntryDto::name, PresenceEntryDto::editing)
        .containsExactly(org.assertj.core.groups.Tuple.tuple("ana", false));
  }

  /**
   * GA review S9: a record the caller may not open (its view is @EyesOnly for another role, or no
   * type the app exposes) tells them nothing and does not show them there.
   */
  @Test
  void aRecordTheCallerMayNotOpenTellsThemNothing() throws Throwable {
    var manager =
        new FakeHttpRequest(payslipRq("tab-m", "viewing", PayslipView.class.getName()))
            .withAttribute("baseUrl", "");
    manager.withPrincipal(
        new io.mateu.core.infra.security.AuthenticatedPrincipal(
            io.mateu.uidl.security.CallerIdentity.withRoles("mia", List.of("manager"))));
    mateu
        .service()
        .runAction("", payslipRq("tab-m", "viewing", PayslipView.class.getName()), "", manager)
        .blockLast();
    try {
      // bob (no manager role) asks about the payslip mia has open: nothing comes back...
      var answer =
          run(payslipRq("tab-b", "editing", PayslipView.class.getName()), "bob").commands();
      assertThat(answer).isEmpty();
      // ...and mia does not see bob there
      var seenByMia =
          mateu
              .service()
              .runAction(
                  "", payslipRq("tab-m", "viewing", PayslipView.class.getName()), "", manager)
              .blockLast()
              .commands();
      assertThat(seenByMia)
          .allSatisfy(c -> assertThat(((PresenceDto) c.data()).entries()).isEmpty());
      // a view the app does not expose at all: nothing either
      assertThat(run(payslipRq("tab-b", "viewing", "io.example.Nowhere"), "bob").commands())
          .isEmpty();
    } finally {
      mateu
          .service()
          .runAction("", payslipRq("tab-m", "leave", PayslipView.class.getName()), "", manager)
          .blockLast();
    }
  }

  private static RunActionRqDto payslipRq(String tab, String state, String view) {
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("route", "payslips/3");
    parameters.put("view", view);
    parameters.put("tab", tab);
    parameters.put("state", state);
    return RunActionRqDto.builder()
        .route(routeOf(Desk.class))
        .consumedRoute(routeOf(Desk.class))
        .serverSideType(Desk.class.getName())
        .actionId("_presence")
        .initiatorComponentId("_ux")
        .componentState(Map.of())
        .parameters(parameters)
        .build();
  }

  @Test
  void onePersonInTwoTabsIsOneEntryEditingIfAnyTabEdits() {
    open(Desk.class, "ana", "tab-1", "orders/8", "viewing");
    open(Desk.class, "ana", "tab-2", "orders/8", "editing");
    var seenByBob = presence(Desk.class, "bob", "tab-b", "orders/8", "viewing");
    opened.add(new Object[] {Desk.class, "bob", "tab-b", "orders/8"});
    assertThat(seenByBob.entries()).hasSize(1);
    assertThat(seenByBob.entries().get(0).editing()).isTrue();
  }

  @Test
  void anotherRecordOrAnotherAppNeverSeesIt() {
    open(Desk.class, "ana", "tab-a", "orders/9", "editing");
    assertThat(presence(Desk.class, "bob", "tab-b", "orders/10", "viewing").entries()).isEmpty();
    opened.add(new Object[] {Desk.class, "bob", "tab-b", "orders/10"});
    assertThat(presence(OtherDesk.class, "bob", "tab-c", "orders/9", "viewing").entries())
        .isEmpty();
    opened.add(new Object[] {OtherDesk.class, "bob", "tab-c", "orders/9"});
  }

  @Test
  void anonymousCallersNeitherShowNorSee() {
    open(Desk.class, "ana", "tab-a", "orders/11", "viewing");
    var anonymous = run(rq(Desk.class, "orders/11", "tab-x", "editing"), null);
    assertThat(anonymous.commands()).isEmpty();
    assertThat(presence(Desk.class, "bob", "tab-b", "orders/11", "viewing").entries())
        .extracting(PresenceEntryDto::name)
        .containsExactly("ana");
    opened.add(new Object[] {Desk.class, "bob", "tab-b", "orders/11"});
  }

  @Test
  void aCreatePageAndAnAppWithoutPresenceTakeNoPart() {
    assertThat(run(rq(Desk.class, "orders/new", "tab-a", "editing"), "ana").commands()).isEmpty();
    assertThat(run(rq(PlainDesk.class, "orders/12", "tab-a", "viewing"), "ana").commands())
        .isEmpty();
  }

  @Test
  void leavingTakesTheTabOff() {
    open(Desk.class, "ana", "tab-a", "orders/13", "editing");
    presence(Desk.class, "ana", "tab-a", "orders/13", "leave");
    assertThat(presence(Desk.class, "bob", "tab-b", "orders/13", "viewing").entries()).isEmpty();
    opened.add(new Object[] {Desk.class, "bob", "tab-b", "orders/13"});
  }

  @Test
  void changesArePushedOnlyToThePeopleOnTheRecord() throws Exception {
    open(Desk.class, "ana", "tab-a", "orders/14", "viewing");
    open(Desk.class, "carol", "tab-c", "orders/15", "viewing");
    var anas = new CopyOnWriteArrayList<UIIncrementDto>();
    var carols = new CopyOnWriteArrayList<UIIncrementDto>();
    var otherApps = new CopyOnWriteArrayList<UIIncrementDto>();
    var s1 = stream(Desk.class, "ana").subscribe(anas::add);
    var s2 = stream(Desk.class, "carol").subscribe(carols::add);
    var s3 = stream(OtherDesk.class, "ana").subscribe(otherApps::add);
    try {
      await(() -> !anas.isEmpty() && !carols.isEmpty() && !otherApps.isEmpty());
      open(Desk.class, "bob", "tab-b", "orders/14", "editing");
      await(() -> !changes(anas).isEmpty());
      Thread.sleep(100);
      var change = changes(anas).get(changes(anas).size() - 1);
      assertThat(change.key()).isEqualTo("orders/14|" + OrderView.class.getName());
      assertThat(change.entries())
          .extracting(PresenceEntryDto::name, PresenceEntryDto::editing)
          .containsExactly(org.assertj.core.groups.Tuple.tuple("bob", true));
      assertThat(changes(carols)).isEmpty();
      assertThat(changes(otherApps)).isEmpty();
    } finally {
      s1.dispose();
      s2.dispose();
      s3.dispose();
    }
  }

  // --- helpers

  private AppDto app(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  private void open(Class<?> app, String who, String tab, String route, String state) {
    presence(app, who, tab, route, state);
    opened.add(new Object[] {app, who, tab, route});
  }

  private static PresenceDto presence(
      Class<?> app, String who, String tab, String route, String state) {
    var increment = run(rq(app, route, tab, state), who);
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.PresenceChanged)
        .map(c -> (PresenceDto) c.data())
        .findFirst()
        .orElse(new PresenceDto(null, List.of()));
  }

  private static RunActionRqDto rq(Class<?> app, String route, String tab, String state) {
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("route", route);
    parameters.put("view", OrderView.class.getName());
    parameters.put("tab", tab);
    parameters.put("state", state);
    return RunActionRqDto.builder()
        .route(routeOf(app))
        .consumedRoute(routeOf(app))
        .serverSideType(app.getName())
        .actionId("_presence")
        .initiatorComponentId("_ux")
        .componentState(Map.of())
        .parameters(parameters)
        .build();
  }

  private static String routeOf(Class<?> app) {
    return app.getAnnotation(UI.class).value();
  }

  private static UIIncrementDto run(RunActionRqDto rq, String who) {
    return streamAs(rq, who).blockLast();
  }

  private static reactor.core.publisher.Flux<UIIncrementDto> stream(Class<?> app, String who) {
    var rq =
        RunActionRqDto.builder()
            .route(routeOf(app))
            .consumedRoute(routeOf(app))
            .serverSideType(app.getName())
            .actionId("_live-updates")
            .initiatorComponentId("_ux")
            .componentState(Map.of())
            .parameters(Map.of())
            .build();
    return streamAs(rq, who);
  }

  private static reactor.core.publisher.Flux<UIIncrementDto> streamAs(
      RunActionRqDto rq, String who) {
    var request = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
    if (who != null) {
      request.withPrincipal(
          new io.mateu.core.infra.security.AuthenticatedPrincipal(
              io.mateu.uidl.security.CallerIdentity.withRoles(who, List.of("user"))));
    }
    try {
      return mateu.service().runAction("", rq, "", request);
    } catch (Throwable t) {
      throw new AssertionError(t);
    }
  }

  private static List<PresenceDto> changes(List<UIIncrementDto> increments) {
    return increments.stream()
        .flatMap(i -> i.commands().stream())
        .filter(c -> c.type() == UICommandTypeDto.PresenceChanged)
        .map(c -> (PresenceDto) c.data())
        .toList();
  }

  private static void await(java.util.function.BooleanSupplier condition) throws Exception {
    for (int i = 0; i < 200 && !condition.getAsBoolean(); i++) {
      Thread.sleep(20);
    }
    assertThat(condition.getAsBoolean()).as("condition met in time").isTrue();
  }
}
