package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.sun.net.httpserver.HttpServer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceEntry;
import io.mateu.uidl.interfaces.RestSourceCatalogSupplier;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Whether a view advertises {@code __restfetch__} is decided by the RESOLVED source: a
 * {@code @RestOptions(source = "products")} whose catalogue entry says {@code proxy: true} is as
 * proxied as one that says {@code proxy = true} itself. Judged by the declaration alone, the view
 * never advertised the action and the browser dropped the fetch ("no component on the page handles
 * it"), so the field got no options. The .NET and Python ports already decided it this way.
 */
class RestOptionsCatalogueProxySyncTest {

  static final int PORT = 19077;

  static final String BASE = "http://127.0.0.1:" + PORT;

  @SuppressWarnings("unused")
  @UI("/restoptions-catalogue-proxy")
  @Title("Options through the catalogue")
  public static class ProductPicker {
    // proxied by the field itself
    @RestOptions(url = BASE + "/products", proxy = true)
    String declaredProxy;

    // proxied only because the catalogue entry it names says so
    @RestOptions(source = "proxiedProducts")
    String catalogueProxy;
  }

  @SuppressWarnings("unused")
  @UI("/restoptions-catalogue-proxy-only")
  @Title("Only the catalogue says proxy")
  public static class CatalogueOnlyPicker {
    @RestOptions(source = "proxiedProducts")
    String product;
  }

  /** The catalogue entry: proxied, though no surface naming it says so. */
  public static class Catalogue implements RestSourceCatalogSupplier {
    @Override
    public List<RestSourceEntry> restSources() {
      return List.of(
          new RestSourceEntry(
              "proxiedProducts",
              RestDataSource.builder().url(BASE + "/products").proxy(true).build()));
    }
  }

  static TestMateu mateu;
  static HttpServer upstream;

  @BeforeAll
  static void boot() throws Exception {
    upstream = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 0);
    upstream.createContext(
        "/products",
        exchange -> {
          var answer =
              "[{\"value\": \"p1\", \"label\": \"Laptop\"}, {\"value\": \"p2\", \"label\": \"Phone\"}]"
                  .getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(200, answer.length);
          exchange.getResponseBody().write(answer);
          exchange.close();
        });
    upstream.start();
    mateu =
        TestMateu.withUisAndBeans(
            List.of(new Catalogue()), ProductPicker.class, CatalogueOnlyPicker.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    upstream.stop(0);
  }

  static boolean advertisesRestfetch(String route) {
    var component = (ServerSideComponentDto) mateu.sync(route).fragments().get(0).component();
    return component.actions().stream().anyMatch(a -> "__restfetch__".equals(a.id()));
  }

  static Object options(String route, String fieldId) {
    @SuppressWarnings("unchecked")
    var appData =
        (Map<String, Object>)
            mateu
                .run(
                    RunActionRqDto.builder()
                        .route(route)
                        .actionId("__restfetch__")
                        .parameters(Map.of("_sourceKind", "options", "_sourceId", fieldId))
                        .componentState(Map.of())
                        .build())
                .appData();
    return appData.get("_restfetch");
  }

  @Test
  void aViewWhoseOnlyProxiedSourceIsProxiedByTheCatalogueAdvertisesRestfetch() {
    assertThat(advertisesRestfetch("/restoptions-catalogue-proxy-only")).isTrue();
  }

  @Test
  void bothFieldsAdvertiseRestfetchAndGetTheirOptions() {
    assertThat(advertisesRestfetch("/restoptions-catalogue-proxy")).isTrue();
    assertThat(String.valueOf(options("/restoptions-catalogue-proxy", "declaredProxy")))
        .contains("Laptop", "Phone");
    assertThat(String.valueOf(options("/restoptions-catalogue-proxy", "catalogueProxy")))
        .contains("Laptop", "Phone");
  }

  @Test
  void theCatalogueOnlyFieldGetsItsOptions() {
    assertThat(String.valueOf(options("/restoptions-catalogue-proxy-only", "product")))
        .contains("Laptop", "Phone");
  }
}
