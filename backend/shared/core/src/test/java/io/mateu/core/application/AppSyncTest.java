package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.AI;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.FavIcon;
import io.mateu.uidl.annotations.HomeRoute;
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
  @HomeRoute("/shop/catalog")
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
            SupplierHomeApp.class);
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

  @Test
  void smoke() {
    assertThat(mateu.sync("/shop").fragments()).isNotEmpty();
  }
}
