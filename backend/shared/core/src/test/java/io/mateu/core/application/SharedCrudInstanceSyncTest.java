package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.CrudHistoryPathSyncTest.Product;
import io.mateu.core.application.CrudHistoryPathSyncTest.ProductsCrud;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.aop.framework.ProxyFactory;

/**
 * A CRUD the container shares between requests — a singleton, an {@code @ApplicationScoped} bean,
 * which Quarkus hands out behind a client proxy — must behave exactly like the per-request one.
 *
 * <p>It did not: the orchestrator keeps its routing in the instance, so a route load of one request
 * ("this crud is mounted at /shop/products") stayed in it for the next one, and the "new" action of
 * a request that never said so pushed {@code /shop/products/new} RELATIVE to a page the browser
 * already has at {@code /shop/products} — {@code /shop/products/shop/products/new}, the workshop's
 * {@code /app/estudiantes/estudiantes/new}. Behind a proxy the request's state was even written
 * into the proxy's fields while the methods ran on the real instance.
 */
class SharedCrudInstanceSyncTest {

  /** The service a constructor-injected crud depends on. */
  public static class ProductService {
    List<Product> all() {
      return CrudHistoryPathSyncTest.PRODUCTS;
    }
  }

  /** A singleton with constructor injection and init code, the way a container builds it. */
  public static class InjectedProductsCrud
      extends io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud<Product> {
    final ProductService service;
    String initialised;

    @Inject
    public InjectedProductsCrud(ProductService service) {
      this.service = service;
    }

    @PostConstruct
    void init() {
      initialised = "yes";
    }

    @Override
    public CrudStore<Product> store() {
      if (service == null || !"yes".equals(initialised)) {
        throw new IllegalStateException("not built like a bean");
      }
      return new ProductsCrud().store();
    }
  }

  @SuppressWarnings("unused")
  public static class SharedMenu {
    @Menu ProductsCrud products;
    @Menu InjectedProductsCrud injected;
  }

  @UI("/_shared")
  @Title("Shared")
  public static class SharedHome {
    @Menu SharedMenu shop;
  }

  static TestMateu mateu;
  static InjectedProductsCrud singleton;

  @BeforeAll
  static void boot() {
    CrudHistoryPathSyncTest.PRODUCTS.clear();
    CrudHistoryPathSyncTest.PRODUCTS.add(new Product("p1", "Anchovies"));
    // the shape of a CDI client proxy / a Spring AOP proxy: a subclass instance whose fields are
    // not the ones its methods use
    var proxy = new ProxyFactory(new ProductsCrud());
    proxy.setProxyTargetClass(true);
    var service = new ProductService();
    singleton = new InjectedProductsCrud(service);
    singleton.init();
    mateu =
        TestMateu.withUisAndBeans(List.of(proxy.getProxy(), singleton, service), SharedHome.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Map<String, Object> load(String route) {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute("")
                .serverSideType(SharedHome.class.getName())
                .actionId("")
                .initiatorComponentId("c1")
                .componentState(Map.of())
                .parameters(Map.of())
                .build());
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && state.containsKey("_componentRoute")) {
        @SuppressWarnings("unchecked")
        var typed = (Map<String, Object>) state;
        return typed;
      }
    }
    return Map.of();
  }

  /** A crud toolbar action, sent from a page the browser has at {@code consumed}. */
  private static String pushedBy(
      Class<?> crud, String actionId, String route, String consumed, Map<String, Object> state) {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route(route)
                .consumedRoute(consumed)
                .serverSideType(crud.getName())
                .actionId(actionId)
                .initiatorComponentId("c1_app")
                .componentState(state)
                .parameters(Map.of())
                .build());
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.PushStateToHistory)
        .map(c -> String.valueOf(c.data()))
        .findFirst()
        .orElse(null);
  }

  @Test
  void aProxiedSingletonCrudDoesNotCarryOneRequestsRouteIntoTheNext() {
    for (int i = 0; i < 2; i++) {
      var state = load("/shop/products");
      assertThat(state).containsEntry("_componentRoute", "/shop/products");
      // a request that brings its own routing gets the absolute url
      assertThat(pushedBy(ProductsCrud.class, "new", "/shop/products", "", state))
          .isEqualTo("/shop/products/new");
      // and one from a page already at the crud gets the relative one — not the previous
      // request's mount prepended to it
      assertThat(pushedBy(ProductsCrud.class, "new", "/shop/products", "/shop/products", Map.of()))
          .isEqualTo("/new");
    }
  }

  @Test
  void interleavedUsersOfASingletonCrudDoNotSeeEachOthersRouting() {
    var userA = load("/shop/injected");
    var userB = load("/shop/injected");
    assertThat(
            pushedBy(
                InjectedProductsCrud.class, "new", "/shop/injected", "/shop/injected", Map.of()))
        .isEqualTo("/new");
    assertThat(pushedBy(InjectedProductsCrud.class, "new", "/shop/injected", "", userA))
        .isEqualTo("/shop/injected/new");
    assertThat(
            pushedBy(
                InjectedProductsCrud.class,
                "edit",
                "/shop/injected/p1",
                "/shop/injected",
                Map.of("id", "p1")))
        .isEqualTo("/p1/edit");
    assertThat(
            pushedBy(InjectedProductsCrud.class, "view", "/shop/injected", "", plus(userB, "p1")))
        .isEqualTo("/shop/injected/p1");
  }

  @Test
  void theSharedInstanceItselfIsNeverWrittenTo() {
    load("/shop/injected");
    pushedBy(InjectedProductsCrud.class, "new", "/shop/injected", "", load("/shop/injected"));
    assertThat(singleton.routingState())
        .containsEntry("_componentRoute", "")
        .containsEntry("_componentRouteEstablished", false);
  }

  private static Map<String, Object> plus(Map<String, Object> state, String id) {
    var copy = new java.util.HashMap<>(state);
    copy.put("id", id);
    return copy;
  }
}
