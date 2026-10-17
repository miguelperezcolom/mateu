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
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A code-authored {@link AppShell} on a NON-ROOT app ({@code @UI("/shellapp")}): its entries may be
 * spelled absolute, with the app's own route ({@code /shellapp/home} — the natural spelling in
 * code), or mount-relative ({@code /settings}), and a group's entries may repeat the group's path.
 * Each must be routed once: prepending the app's route (and the group's path) blindly produced
 * {@code /shellapp/shellapp/home} and {@code /shellapp/reports/shellapp/reports/sales}.
 */
class CodeAppShellRoutesSyncTest {

  @UI("/shellapp/home")
  @Title("Home page")
  public static class ShellHome {
    public String value = "home";
  }

  @UI("/shellapp/reports/sales")
  @Title("Sales page")
  public static class ShellSales {
    public String value = "sales";
  }

  @UI("/shellapp/settings")
  @Title("Settings page")
  public static class ShellSettings {
    public String value = "settings";
  }

  @UI("/shellapp")
  public static class ShellApp implements AppSupplier {
    @Override
    public AppShell getApp(HttpRequest httpRequest) {
      return AppShell.builder()
          .title("Shell app")
          .homeRoute("/shellapp/home")
          .menu(
              List.of(
                  new RouteLink("/shellapp/home", "Home"),
                  new Menu(
                      "/shellapp/reports",
                      "Reports",
                      List.of(new RouteLink("/shellapp/reports/sales", "Sales"))),
                  new RouteLink("/settings", "Settings")))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(ShellApp.class, ShellHome.class, ShellSales.class, ShellSettings.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static AppDto appOf(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ClientSideComponentDto)
        .map(component -> ((ClientSideComponentDto) component).metadata())
        .filter(metadata -> metadata instanceof AppDto)
        .map(metadata -> (AppDto) metadata)
        .findFirst()
        .orElseThrow(() -> new AssertionError("no app in " + increment));
  }

  private static Stream<MenuOptionDto> entries(List<MenuOptionDto> menu) {
    return menu.stream()
        .flatMap(entry -> Stream.concat(Stream.of(entry), entries(entry.submenus())));
  }

  private static MenuOptionDto entry(AppDto app, String label) {
    return entries(app.menu())
        .filter(option -> label.equals(option.label()))
        .findFirst()
        .orElseThrow();
  }

  private static String screenOf(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(component -> component instanceof ServerSideComponentDto)
        .map(component -> ((ServerSideComponentDto) component).serverSideType())
        .findFirst()
        .orElseThrow(() -> new AssertionError("no screen in " + increment));
  }

  private static UIIncrementDto content(String route, String consumedRoute) {
    try {
      var rq =
          RunActionRqDto.builder()
              .route(route)
              .consumedRoute(consumedRoute)
              .serverSideType(ShellApp.class.getName())
              .actionId("")
              .initiatorComponentId("ux_root")
              .build();
      return mateu
          .service()
          .runAction("", rq, "", new FakeHttpRequest(rq).withAttribute("baseUrl", ""))
          .blockFirst();
    } catch (Throwable t) {
      throw new AssertionError(t);
    }
  }

  @Test
  void absoluteAndMountRelativeEntriesAreRoutedOnceUnderTheMount() {
    var app = appOf(mateu.sync("/shellapp"));
    assertThat(entry(app, "Home").route()).isEqualTo("/shellapp/home");
    assertThat(entry(app, "Home").path()).isEqualTo("/home");
    assertThat(entry(app, "Reports").route()).isEqualTo("/shellapp/reports");
    assertThat(entry(app, "Sales").route()).isEqualTo("/shellapp/reports/sales");
    assertThat(entry(app, "Settings").route()).isEqualTo("/shellapp/settings");
  }

  @Test
  void everyEntryLoadsItsPage() {
    var app = appOf(mateu.sync("/shellapp"));
    assertThat(screenOf(content(entry(app, "Home").route(), entry(app, "Home").consumedRoute())))
        .isEqualTo(ShellHome.class.getName());
    assertThat(screenOf(content(entry(app, "Sales").route(), entry(app, "Sales").consumedRoute())))
        .isEqualTo(ShellSales.class.getName());
    assertThat(
            screenOf(
                content(entry(app, "Settings").route(), entry(app, "Settings").consumedRoute())))
        .isEqualTo(ShellSettings.class.getName());
  }

  @Test
  void aDeepLinkSelectsTheEntryWhateverItsSpelling() {
    var sales = entry(appOf(mateu.sync("/shellapp/reports/sales")), "Sales");
    assertThat(sales.selected()).isTrue();
    var home = entry(appOf(mateu.sync("/shellapp/home")), "Home");
    assertThat(home.selected()).isTrue();
  }
}
