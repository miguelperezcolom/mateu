package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sun.net.httpserver.HttpServer;
import io.mateu.core.application.runaction.Environments;
import io.mateu.core.application.runaction.RestSourceRegistry;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.slf4j.LoggerFactory;

/**
 * Environments for REST sources: a {@code type: Environment} file re-points named sources of the
 * catalogue for the ACTIVE environment ({@code mateu.environment} / {@code MATEU_ENVIRONMENT})
 * without editing {@code sources.yaml} — on every leg: the wire catalogue, the server-side proxy
 * and the bundle manifest.
 */
class YamlEnvironmentsSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  @TempDir Path dir;

  private Path fixture(String preOrdersBaseUrl) {
    return SpecsDir.write(
        dir,
        Map.of(
            "sources.yaml",
            """
            type: Sources
            sources:
              - name: orders
                source:
                  url: https://api.acme.com/v1/orders?status=${state.status}
                  itemsPath: content
              - name: payments
                source:
                  url: https://pay.acme.com/v1/payments
                  headers: {X-Tenant: acme}
            """,
            "environments/pre.yaml",
            """
            sources:
              orders: {baseUrl: %s, proxy: true}
              payments:
                url: https://pre.pay.acme.com/v2/payments
                headers: {Authorization: "Bearer ${secret.PAY_TOKEN}"}
            """
                .formatted(preOrdersBaseUrl),
            "envs/pro.yaml",
            """
            type: Environment
            name: pro
            sources:
              payments: {headers: {X-Api-Key: literal-oops}}
            """,
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: ""
                layout: shell.yaml
              - route: orders
                layout: orders.yaml
            """,
            "shell.yaml",
            """
            type: AppShell
            title: Shop
            homeRoute: orders
            menu:
              - {type: RouteLink, label: Orders, route: orders}
            """,
            "orders.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - {type: Button, label: Refresh, actionId: fetchOrders}
            actions:
              - id: fetchOrders
                restAction:
                  source: {ref: orders}
            """));
  }

  private static <T> T inEnvironment(String name, Supplier<T> body) {
    var previous = System.getProperty(Environments.PROPERTY);
    if (name == null) {
      System.clearProperty(Environments.PROPERTY);
    } else {
      System.setProperty(Environments.PROPERTY, name);
    }
    try {
      return body.get();
    } finally {
      if (previous == null) {
        System.clearProperty(Environments.PROPERTY);
      } else {
        System.setProperty(Environments.PROPERTY, previous);
      }
    }
  }

  @Test
  void theActiveEnvironmentRepointsTheNamedSourcesOnly() {
    var root = fixture("https://pre.api.acme.com");
    var catalog =
        inEnvironment("pre", () -> SpecsDir.over(root, cl -> new RestSourceRegistry().catalog()));
    var orders = catalog.get("orders").orElseThrow().source();
    assertThat(orders.url()).isEqualTo("https://pre.api.acme.com/v1/orders?status=${state.status}");
    assertThat(orders.proxy()).isTrue();
    assertThat(orders.itemsPath()).as("the contract is untouched").isEqualTo("content");
    var payments = catalog.get("payments").orElseThrow().source();
    assertThat(payments.url()).isEqualTo("https://pre.pay.acme.com/v2/payments");
    assertThat(payments.headers())
        .containsEntry("X-Tenant", "acme")
        .containsEntry("Authorization", "Bearer ${secret.PAY_TOKEN}");

    var authored =
        inEnvironment(null, () -> SpecsDir.over(root, cl -> new RestSourceRegistry().catalog()));
    assertThat(authored.get("orders").orElseThrow().source().url())
        .isEqualTo("https://api.acme.com/v1/orders?status=${state.status}");
    assertThat(authored.get("orders").orElseThrow().source().proxy()).isFalse();
  }

  @Test
  void anUnknownEnvironmentLeavesTheCatalogueAsAuthored() {
    var root = fixture("https://pre.api.acme.com");
    var catalog =
        inEnvironment(
            "staging", () -> SpecsDir.over(root, cl -> new RestSourceRegistry().catalog()));
    assertThat(catalog.get("payments").orElseThrow().source().url())
        .isEqualTo("https://pay.acme.com/v1/payments");
  }

  @Test
  void aLiteralCredentialInAnEnvironmentFileIsWarnedAbout() {
    var logger = (Logger) LoggerFactory.getLogger(Environments.class);
    var appender = new ListAppender<ILoggingEvent>();
    appender.start();
    logger.addAppender(appender);
    try {
      var root = fixture("https://pre.api.acme.com");
      SpecsDir.over(root, cl -> Environments.all(cl));
      assertThat(appender.list)
          .anyMatch(
              e ->
                  e.getFormattedMessage().contains("X-Api-Key")
                      && e.getFormattedMessage().contains("never put a secret"));
      assertThat(appender.list)
          .as("a ${secret.X} placeholder is the right way, not warned about")
          .noneMatch(e -> e.getFormattedMessage().contains("'Authorization'"));
    } finally {
      logger.detachAppender(appender);
    }
  }

  @Test
  void theRebaseRuleKeepsPathQueryAndPlaceholders() {
    assertThat(Environments.rebase("https://a.com/v1/x?q=${state.q}", "https://b.com"))
        .isEqualTo("https://b.com/v1/x?q=${state.q}");
    assertThat(Environments.rebase("https://a.com:8443/v1/x", "http://b.com/api/"))
        .isEqualTo("http://b.com/api/v1/x");
    assertThat(Environments.rebase("/api/orders", "https://pre.acme.com"))
        .isEqualTo("https://pre.acme.com/api/orders");
    assertThat(Environments.rebase("https://a.com", "https://b.com")).isEqualTo("https://b.com");
  }

  @Test
  void theWireCatalogueCarriesTheActiveEnvironment() {
    var root = fixture("https://pre.api.acme.com");
    var wire =
        inEnvironment(
            "pre",
            () ->
                SpecsDir.over(
                    root,
                    cl -> {
                      try (var mateu = TestMateu.withUis()) {
                        var rq =
                            RunActionRqDto.builder()
                                .route("/")
                                .consumedRoute("_empty")
                                .actionId("")
                                .build();
                        return JSON.valueToTree(mateu.run(rq)).toString();
                      }
                    }));
    assertThat(wire).contains("https://pre.api.acme.com/v1/orders");
    assertThat(wire).doesNotContain("https://api.acme.com/v1/orders");
  }

  @Test
  void theProxyLegCallsTheEnvironmentsEndpoint() throws Exception {
    var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    var hit = new AtomicReference<String>();
    server.createContext(
        "/v1/orders",
        exchange -> {
          hit.set(exchange.getRequestURI().toString());
          var body = "{\"content\":[{\"id\":1,\"from\":\"pre\"}]}".getBytes(StandardCharsets.UTF_8);
          exchange.getResponseHeaders().add("Content-Type", "application/json");
          exchange.sendResponseHeaders(200, body.length);
          exchange.getResponseBody().write(body);
          exchange.close();
        });
    server.start();
    try {
      var root = fixture("http://127.0.0.1:" + server.getAddress().getPort());
      var wire =
          inEnvironment(
              "pre",
              () ->
                  SpecsDir.over(
                      root,
                      cl -> {
                        try (var mateu = TestMateu.withUis()) {
                          var rq =
                              RunActionRqDto.builder()
                                  .route("/orders")
                                  .consumedRoute("/")
                                  .actionId("__restfetch__")
                                  .componentState(Map.of("status", "open"))
                                  .parameters(
                                      Map.of("_sourceKind", "action", "_sourceId", "fetchOrders"))
                                  .build();
                          return JSON.valueToTree(mateu.run(rq)).toString();
                        }
                      }));
      assertThat(hit.get()).isEqualTo("/v1/orders?status=open");
      assertThat(wire).contains("\"from\":\"pre\"");
    } finally {
      server.stop(0);
    }
  }
}
