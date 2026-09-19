package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Logo;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.Submenu;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.net.URI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/** Exploratory version: dump the wire JSON for app shell / menu / routing syncs. */
class AppSyncTest {

  // ── fixtures: pages ────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/shop/catalog")
  @Title("Catalog")
  public static class CatalogPage {
    String q = "all";
  }

  @SuppressWarnings("unused")
  @UI("/things/:id")
  @Title("Thing")
  public static class ThingPage {
    String id;
    String name = "unnamed";
  }

  // ── fixtures: submenus ─────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  public static class ReportsMenu implements Submenu {
    @Menu String sales = "/shop/reports/sales";

    @Menu String stock = "/shop/reports/stock";
  }

  @SuppressWarnings("unused")
  public static class LeafMenu implements Submenu {
    @Menu String leafOption = "/deepapp/leaf";
  }

  @SuppressWarnings("unused")
  public static class MidMenu implements Submenu {
    @Menu LeafMenu inner;
  }

  /** Composed (semantic) annotation putting @Menu on a method. */
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  @Menu
  @interface MenuEntry {}

  // ── fixtures: apps ─────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/shop")
  @Title("Shop admin")
  @Subtitle("Backoffice")
  @Logo("/img/logo.png")
  @FavIcon("/img/fav.ico")
  @App(value = AppVariant.MENU_ON_TOP, layout = AppLayout.SPLIT, themeToggle = true)
  @AI(sse = "http://localhost:9999/ai/stream")
  public static class ShopApp {
    @Menu
    @Label("Catálogo")
    RouteLink catalog = new RouteLink("/shop/catalog", "Catálogo");

    @Menu String orders = "/shop/orders";

    @Menu(description = "External docs")
    URI docs = URI.create("https://mateu.io/docs");

    @Menu ReportsMenu reports;

    @Menu
    @EyesOnly(roles = "admin")
    String secret = "/shop/secret";

    @MenuEntry
    @Label("Cerrar caja")
    public void closeTill() {}

    @Fab(icon = "vaadin:plus")
    @Label("New order")
    public void newOrder() {}
  }

  @SuppressWarnings("unused")
  @UI("/wideapp")
  public static class WideApp {
    @Menu ReportsMenu reports;

    @Menu String o1 = "/wideapp/o1";

    @Menu String o2 = "/wideapp/o2";

    @Menu String o3 = "/wideapp/o3";

    @Menu String o4 = "/wideapp/o4";

    @Menu String o5 = "/wideapp/o5";

    @Menu String o6 = "/wideapp/o6";

    @Menu String o7 = "/wideapp/o7";
  }

  @SuppressWarnings("unused")
  @UI("/deepapp")
  public static class DeepApp {
    @Menu MidMenu mid;

    @Menu String other = "/deepapp/other";
  }

  @SuppressWarnings("unused")
  @UI("/flatapp")
  public static class FlatApp {
    @Menu ReportsMenu reports;

    @Menu String other = "/flatapp/other";
  }

  @SuppressWarnings("unused")
  @UI("/tabsapp")
  public static class TabsApp {
    @Menu String alpha = "/tabsapp/alpha";

    @Menu String beta = "/tabsapp/beta";
  }

  @SuppressWarnings("unused")
  @UI("/supplier")
  @Title("Supplier home")
  public static class SupplierHomeApp implements HomeRouteSupplier {
    @Menu String catalog = "/supplier/catalog";

    @Override
    public String homeRoute() {
      return "/supplier/catalog";
    }
  }

  // ── R2 fixture: an app whose home route resolves to a REAL, distinct Screen class ──────────────
  @SuppressWarnings("unused")
  @UI("/r2home/screen")
  @Title("R2 home screen")
  public static class R2HomeScreen {
    String note = "home content";
  }

  @SuppressWarnings("unused")
  @UI("/r2home")
  @Title("R2 app")
  public static class R2App implements HomeRouteSupplier {
    @Menu String screen = "/r2home/screen";

    @Override
    public String homeRoute() {
      return "/r2home/screen";
    }
  }

  // ── harness ────────────────────────────────────────────────────────────────

  static TestMateu mateu;
  static final ObjectMapper json = new ObjectMapper().findAndRegisterModules();

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            ShopApp.class,
            CatalogPage.class,
            ThingPage.class,
            WideApp.class,
            DeepApp.class,
            FlatApp.class,
            TabsApp.class,
            SupplierHomeApp.class,
            R2HomeScreen.class,
            R2App.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static void dump(String name, Object o) throws Exception {
    System.out.println("==== " + name + " ====");
    System.out.println(json.writerWithDefaultPrettyPrinter().writeValueAsString(o));
  }

  // ── exploration ────────────────────────────────────────────────────────────

  @Test
  void exploreShopRoot() throws Exception {
    dump("sync /shop", mateu.sync("/shop"));
  }

  @Test
  void exploreShopCatalog() throws Exception {
    dump("sync /shop/catalog", mateu.sync("/shop/catalog"));
  }

  @Test
  void exploreThing() throws Exception {
    dump("sync /things/42", mateu.sync("/things/42"));
  }

  @Test
  void exploreTyped() throws Exception {
    dump(
        "typed run",
        mateu.run(
            RunActionRqDto.builder()
                .serverSideType(ShopApp.class.getName())
                .consumedRoute("")
                .route("/shop/orders")
                .actionId("")
                .build()));
  }

  @Test
  void exploreVariants() throws Exception {
    dump("sync /wideapp", mateu.sync("/wideapp"));
    dump("sync /deepapp", mateu.sync("/deepapp"));
    dump("sync /flatapp", mateu.sync("/flatapp"));
    dump("sync /tabsapp", mateu.sync("/tabsapp"));
    dump("sync /supplier", mateu.sync("/supplier"));
  }

  // ── R2 characterization: App ≠ its Home Screen (coherence-plan) ─────────────────
  // These PIN the CURRENT home-route resolution so the eventual removal of the "@UI class is both
  // the app and its home view" conflation (R2) is a safe, reviewed change: any behaviour shift has
  // to update a named characterization test deliberately, rather than slipping through. They assert
  // what the wire says TODAY — including the conflation R2 will remove — not the target state.

  private static AppDto appOf(String route) {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync(route).fragments().get(0).component(), AppDto.class);
  }

  @Test
  void r2_anAppIsServedAtItsBasePathAndItsHomeIsADistinctRoute() {
    // The one piece of R2 that is already clean: an app declaring a home (HomeRouteSupplier) is
    // served at its base path, and the home is a SEPARATE route (a Screen), not the base path.
    var app = appOf("/supplier");
    assertThat(app.route()).isEqualTo("/supplier");
    assertThat(app.homeRoute()).isEqualTo("/supplier/catalog");
    assertThat(app.homeRoute()).isNotEqualTo(app.route());
  }

  @Test
  void r2_aHomeThatResolvesToADistinctScreenIsTypedWithThatScreensClass() {
    // R2 landed: /r2home's home route (/r2home/screen) resolves to a REAL, distinct routed class
    // (R2HomeScreen), so the home fragment is typed with the home SCREEN's class — the App is no
    // longer fused with its home. The App's own serverSideType stays the app class (it renders the
    // chrome around the content slot).
    var app = appOf("/r2home");
    assertThat(app.homeRoute()).isEqualTo("/r2home/screen");
    assertThat(app.homeServerSideType()).isEqualTo(R2HomeScreen.class.getName());
    assertThat(app.serverSideType()).isEqualTo(R2App.class.getName());
    assertThat(app.homeServerSideType()).isNotEqualTo(app.serverSideType());
  }

  @Test
  void r2_aHomeWithNoBackingScreenKeepsTheAppsOwnType() {
    // A home route that no routed class answers (a bare @Menu link — /supplier/catalog has no @UI
    // class) is not a separate Screen, so the App remains its own content: homeServerSideType stays
    // the app class. Only the case with a real distinct home Screen de-conflates.
    var app = appOf("/supplier");
    assertThat(app.homeServerSideType()).isEqualTo(SupplierHomeApp.class.getName());
    assertThat(app.serverSideType()).isEqualTo(SupplierHomeApp.class.getName());
  }

  @Test
  void r2_anAppWithoutAnExplicitHomeCarriesTheNoHomeRouteSentinel() {
    // An app that declares only @Menu items (no HomeRouteSupplier) carries the `_no_home_route`
    // sentinel on the wire; the "home defaults to the first menu item" resolution happens later, in
    // AppHomeRouteResolver.getHomeRoute at render time — not in this AppDto field. R2 should make
    // the default uniform (the home is just the first menu item's Screen everywhere).
    assertThat(appOf("/tabsapp").homeRoute()).isEqualTo("_no_home_route");
    assertThat(appOf("/shop").homeRoute()).isEqualTo("_no_home_route");
  }

  @Test
  void smoke() {
    assertThat(mateu.sync("/shop").fragments()).isNotEmpty();
  }
}
