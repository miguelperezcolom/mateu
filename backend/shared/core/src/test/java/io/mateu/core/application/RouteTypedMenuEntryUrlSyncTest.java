package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.Submenu;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A route-typed {@code @Menu String countColdRoom = "/count/cold-room"} entry carries ITS ROUTE on
 * the wire, which is what the renderers push into the address bar. It used to carry the field's
 * name ({@code /countColdRoom}): the right screen loaded (the server dispatched the field to its
 * route), but the browser showed a URL nobody wrote.
 */
class RouteTypedMenuEntryUrlSyncTest {

  @UI("/count/cold-room")
  @Title("Cold room count")
  public static class ColdRoomCount {
    String value = "cold room";
  }

  @UI("/count/freezer")
  @Title("Freezer count")
  public static class FreezerCount {
    String value = "freezer";
  }

  public static class Counts implements Submenu {
    @Menu String freezer = "/count/freezer";
  }

  @UI("")
  @Title("Warehouse")
  public static class WarehouseApp {
    @Menu String countColdRoom = "/count/cold-room";

    @Menu Counts counts;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // a root app changes route resolution for every other fixture: its own harness
    mateu = TestMateu.withUis(WarehouseApp.class, ColdRoomCount.class, FreezerCount.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static UIIncrementDto run(RunActionRqDto rq) {
    try {
      var httpRequest = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
      httpRequest.setAttribute("uiId", WarehouseApp.class.getName());
      return mateu
          .service()
          .runAction(WarehouseApp.class.getName(), rq, "", httpRequest)
          .blockFirst();
    } catch (Throwable t) {
      throw new AssertionError(t);
    }
  }

  static AppDto shell(String route) {
    var increment =
        run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute("_empty")
                .actionId("")
                .initiatorComponentId("_ux")
                .build());
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ClientSideComponentDto)
        .map(component -> ((ClientSideComponentDto) component).metadata())
        .filter(metadata -> metadata instanceof AppDto)
        .map(metadata -> (AppDto) metadata)
        .findFirst()
        .orElseThrow();
  }

  static String screen(String route, String consumedRoute) {
    var increment =
        run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute(consumedRoute)
                .serverSideType(WarehouseApp.class.getName())
                .actionId("")
                .initiatorComponentId("ux_root")
                .build());
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ServerSideComponentDto)
        .map(component -> ((ServerSideComponentDto) component).serverSideType())
        .findFirst()
        .orElseThrow(() -> new AssertionError("no screen in " + increment));
  }

  static List<MenuOptionDto> entries(AppDto app) {
    return app.menu().stream()
        .flatMap(entry -> Stream.concat(Stream.of(entry), entry.submenus().stream()))
        .toList();
  }

  static MenuOptionDto entry(AppDto app, String label) {
    return entries(app).stream()
        .filter(entry -> label.equals(entry.label()))
        .findFirst()
        .orElseThrow(() -> new AssertionError("no menu entry " + label));
  }

  @Test
  void theEntryCarriesItsRouteNotTheFieldName() {
    var option = entry(shell(""), "Count cold room");
    assertThat(option.route()).isEqualTo("/count/cold-room");
    assertThat(option.path()).isEqualTo("/count/cold-room");
  }

  @Test
  void anEntryInAGroupGoesWhereItsRouteSaysNotUnderTheGroup() {
    var option = entry(shell(""), "Freezer");
    assertThat(option.route()).isEqualTo("/count/freezer");
  }

  @Test
  void aClickOnTheEntryLoadsItsScreen() {
    var option = entry(shell(""), "Count cold room");
    assertThat(screen(option.route(), option.consumedRoute()))
        .isEqualTo(ColdRoomCount.class.getName());
    var freezer = entry(shell(""), "Freezer");
    assertThat(screen(freezer.route(), freezer.consumedRoute()))
        .isEqualTo(FreezerCount.class.getName());
  }

  @Test
  void aDeepLinkToTheRouteSelectsTheEntry() {
    var app = shell("/count/cold-room");
    assertThat(entry(app, "Count cold room").selected()).isTrue();
    assertThat(screen(app.homeRoute(), app.homeConsumedRoute()))
        .isEqualTo(ColdRoomCount.class.getName());
  }
}
