package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * The address bar after a crud action, when the crud is mounted UNDER a menu rather than at the
 * root of its app.
 *
 * <p>That distinction is the whole point: a crud declared {@code @UI("/items")} is its own root, so
 * its component route is empty and prepending nothing is right. Mounted under a menu it sits at
 * {@code /shop/products}, and every url it pushes has to carry that prefix — otherwise opening a
 * record and pressing Edit leaves the browser on {@code /p1/edit}, a url that 404s on reload and is
 * useless to paste to anyone.
 */
class CrudHistoryPathSyncTest {

  public static class Product implements Identifiable {
    String id;
    String name;

    public Product() {}

    public Product(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return name;
    }
  }

  static final List<Product> PRODUCTS = new ArrayList<>();

  public static class ProductsCrud extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Product> findById(String id) {
          return PRODUCTS.stream().filter(p -> p.id().equals(id)).findFirst();
        }

        @Override
        public String save(Product entity) {
          if (entity.id == null || entity.id.isBlank()) {
            entity.id = UUID.randomUUID().toString();
            PRODUCTS.add(entity);
          } else {
            PRODUCTS.replaceAll(p -> p.id().equals(entity.id()) ? entity : p);
          }
          return entity.id;
        }

        @Override
        public List<Product> findAll() {
          return PRODUCTS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          PRODUCTS.removeIf(p -> selectedIds.contains(p.id()));
        }
      };
    }
  }

  @SuppressWarnings("unused")
  public static class ShopMenu {
    @Menu ProductsCrud products;
  }

  @UI("/_shop")
  @Title("Shop")
  public static class ShopHome {
    @Menu ShopMenu shop;
  }

  /** The other mounting: its own root, where an empty component route is the correct answer. */
  @UI("/root-products")
  @Title("Products")
  public static class RootProductsCrud extends ProductsCrud {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ShopHome.class, RootProductsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void resetData() {
    PRODUCTS.clear();
    PRODUCTS.add(new Product("p1", "Anchovies"));
  }

  /** What the browser sends for a toolbar action: the url it is on, and no consumed route. */
  private UIIncrementDto runAction(String actionId, String route) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("")
            .serverSideType(ProductsCrud.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(Map.of("id", "p1"))
            .parameters(Map.of())
            .build());
  }

  private static String pushedPath(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.PushStateToHistory)
        .map(c -> String.valueOf(c.data()))
        .findFirst()
        .orElse(null);
  }

  /**
   * All four navigations a crud offers, because the defect is not in one of them: every action that
   * pushes a url pushed it component-relative, while the route LOAD path pushes it absolute. The
   * same {@code PushStateToHistory} channel carrying sometimes one and sometimes the other is the
   * actual bug; fixing only the one that was reported would leave the channel ambiguous.
   */
  @Test
  void openingARecordFromTheListKeepsTheMenuPrefix() {
    assertThat(pushedPath(runAction("view", "/shop/products"))).isEqualTo("/shop/products/p1");
  }

  @Test
  void editingARecordKeepsTheMenuPrefix() {
    assertThat(pushedPath(runAction("edit", "/shop/products/p1")))
        .isEqualTo("/shop/products/p1/edit");
  }

  @Test
  void creatingKeepsTheMenuPrefix() {
    assertThat(pushedPath(runAction("new", "/shop/products"))).isEqualTo("/shop/products/new");
  }

  /**
   * Cancelling pushes nothing at all — asserted rather than left unsaid, because "no url change" is
   * a decision the next person needs to be able to tell apart from an oversight. The browser still
   * leaves the edit form; it does so on the route load that follows, not on this response.
   */
  @Test
  void cancellingPushesNoUrlOfItsOwn() {
    assertThat(pushedPath(runAction("cancel", "/shop/products/p1/edit"))).isNull();
  }

  /**
   * Saving leaves the edit form, so the browser is on {@code .../p1/edit} while the route being
   * navigated to is the record. Both tails have to come off for the mount to be found.
   */
  @Test
  void savingFromTheEditFormKeepsTheMenuPrefix() {
    assertThat(pushedPath(runAction("save", "/shop/products/p1/edit")))
        .isEqualTo("/shop/products/p1");
  }

  /**
   * A crud that IS its own root legitimately has an empty component route, and prepending nothing
   * is the right answer there. This is the case the whole existing test suite exercises, and the
   * one a fix for the above must not disturb.
   */
  @Test
  void aRootMountedCrudStillPushesItsPlainRoute() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/root-products/p1")
                .consumedRoute("/root-products")
                .serverSideType(RootProductsCrud.class.getName())
                .actionId("edit")
                .initiatorComponentId("c2_app")
                .componentState(Map.of("id", "p1"))
                .parameters(Map.of())
                .build());

    assertThat(pushedPath(increment)).isEqualTo("/p1/edit");
  }

  /**
   * A route that carries filters in its query string, which is how a generated navigation asks for
   * a filtered listing — "show me the cancelled ones" becomes {@code
   * /shop/products?status=CANCELLED}.
   *
   * <p>The view's own route must be the path remainder, never the query: the browser round-trips it
   * and appends it to a url that already carries the query, and the doubled {@code ?a=1?a=1} parses
   * as ONE parameter whose value holds the second copy. On a deployment that showed up as a filter
   * chip reading {@code Status: CANCELLED?status=CANCELLED}, matching nothing.
   */
  @Test
  void aFilteredRouteDoesNotMakeTheQueryStringTheViewsRoute() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/shop/products?status=CANCELLED")
                .consumedRoute("")
                // The PARENT home, which is what a generated navigation names: the app resolves
                // the route down to the crud. Naming the crud itself skips the branch entirely.
                .serverSideType(ShopHome.class.getName())
                .actionId("")
                .initiatorComponentId("c3_app")
                .componentState(Map.of())
                .parameters(Map.of())
                .build());

    assertThat(routeInState(increment)).isNotNull().doesNotContain("?");
  }

  /** The view's own route, as it travels back in the fragment state the browser round-trips. */
  private static String routeInState(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && state.get("_route") != null) {
        return String.valueOf(state.get("_route"));
      }
    }
    return null;
  }
}
