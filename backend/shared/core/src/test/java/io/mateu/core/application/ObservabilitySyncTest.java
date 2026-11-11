package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.audit.ActionAuditEvent;
import io.mateu.uidl.audit.ActionAuditListener;
import io.mateu.uidl.audit.ActionOutcome;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import io.opentelemetry.api.common.AttributeKey;
import io.opentelemetry.sdk.OpenTelemetrySdk;
import io.opentelemetry.sdk.metrics.SdkMeterProvider;
import io.opentelemetry.sdk.metrics.data.MetricData;
import io.opentelemetry.sdk.testing.exporter.InMemoryMetricReader;
import io.opentelemetry.sdk.testing.exporter.InMemorySpanExporter;
import io.opentelemetry.sdk.trace.SdkTracerProvider;
import io.opentelemetry.sdk.trace.data.SpanData;
import io.opentelemetry.sdk.trace.export.SimpleSpanProcessor;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Observability of the request path: one OpenTelemetry span + metrics per Mateu request (through
 * the API only, here an in-memory SDK registered as the app's bean) and the {@link
 * ActionAuditListener}s — who, what, on which records, how it ended; never a field value. Mirrored
 * in .NET (ObservabilityTests) and Python (test_observability.py).
 */
class ObservabilitySyncTest {

  @UI("/obs/orders")
  public static class Orders {
    String note = "secret note";

    @Action
    Message place() {
      return new Message("placed");
    }

    @Action
    void outOfStock() {
      throw new UserFacingException("Only 3 units left.");
    }

    @Action
    void bug() {
      throw new IllegalStateException("boom");
    }

    // a proxied write: the server makes the call, as a child span of the request's
    @io.mateu.uidl.annotations.RestAction(
        url = UPSTREAM + "/stock/${state.sku}?key=k-123",
        method = "POST",
        proxy = true)
    public void reserve() {}
  }

  /** The proxied upstream; a port no other core test uses. */
  static final String UPSTREAM = "http://127.0.0.1:19031";

  public static class Item implements Identifiable {
    String id;
    String name;

    public Item() {}

    Item(String id, String name) {
      this.id = id;
      this.name = name;
    }

    @Override
    public String id() {
      return id;
    }
  }

  static final List<Item> ITEMS = new ArrayList<>();

  @UI("/obs/items")
  public static class Items extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Item> findById(String id) {
          return ITEMS.stream().filter(i -> i.id.equals(id)).findFirst();
        }

        @Override
        public String save(Item entity) {
          ITEMS.removeIf(i -> i.id.equals(entity.id));
          ITEMS.add(entity);
          return entity.id;
        }

        @Override
        public List<Item> findAll() {
          return ITEMS;
        }

        @Override
        public void deleteAllById(List<String> selectedIds) {
          ITEMS.removeIf(i -> selectedIds.contains(i.id));
        }
      };
    }

    @ListToolbarButton
    public Message archive(List<Item> selection) {
      return new Message(selection.size() + " archived");
    }
  }

  static final List<ActionAuditEvent> EVENTS = new CopyOnWriteArrayList<>();

  /** Records every event (a concrete class: the container types a lambda bean poorly). */
  public static class Recording implements ActionAuditListener {
    @Override
    public void onAction(ActionAuditEvent event) {
      EVENTS.add(event);
    }
  }

  /** A listener that fails on every call: the request must not notice. */
  public static class Broken implements ActionAuditListener {
    @Override
    public void onAction(ActionAuditEvent event) {
      throw new IllegalStateException("audit store down");
    }
  }

  static final InMemorySpanExporter SPANS = InMemorySpanExporter.create();
  static final InMemoryMetricReader METRICS = InMemoryMetricReader.create();
  static TestMateu mateu;
  static com.sun.net.httpserver.HttpServer upstream;

  @BeforeAll
  static void boot() throws Exception {
    upstream =
        com.sun.net.httpserver.HttpServer.create(
            new java.net.InetSocketAddress("127.0.0.1", 19031), 0);
    upstream.createContext(
        "/stock",
        exchange -> {
          exchange.sendResponseHeaders(204, -1);
          exchange.close();
        });
    upstream.start();
    var otel =
        OpenTelemetrySdk.builder()
            .setTracerProvider(
                SdkTracerProvider.builder()
                    .addSpanProcessor(SimpleSpanProcessor.create(SPANS))
                    .build())
            .setMeterProvider(SdkMeterProvider.builder().registerMetricReader(METRICS).build())
            .build();
    mateu =
        TestMateu.withUisAndBeans(
            List.of(otel, new Recording(), new Broken()), Orders.class, Items.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    upstream.stop(0);
  }

  @BeforeEach
  void clear() {
    EVENTS.clear();
    SPANS.reset();
    ITEMS.clear();
    ITEMS.add(new Item("1", "one"));
    ITEMS.add(new Item("2", "two"));
  }

  private static RunActionRqDto orders(String actionId) {
    return RunActionRqDto.builder()
        .route("/obs/orders")
        .actionId(actionId)
        .serverSideType(Orders.class.getName())
        .componentState(Map.of("note", "secret note"))
        .initiatorComponentId("app")
        .build();
  }

  private static RunActionRqDto items(String actionId, Map<String, Object> state) {
    return RunActionRqDto.builder()
        .route("/obs/items")
        .consumedRoute("/obs/items")
        .serverSideType(Items.class.getName())
        .actionId(actionId)
        .initiatorComponentId("c1_app")
        .componentState(state)
        .build();
  }

  private static SpanData onlyMateuSpan() {
    var spans =
        SPANS.getFinishedSpanItems().stream()
            .filter(
                s ->
                    s.getName().startsWith("mateu ") && !s.getName().startsWith("mateu rest_proxy"))
            .toList();
    assertThat(spans).hasSize(1);
    return spans.get(0);
  }

  private static String attr(SpanData span, String key) {
    return span.getAttributes().get(AttributeKey.stringKey(key));
  }

  @Test
  void aRequestIsOneSpanWithItsRouteActionViewOutcomeAndCorrelationId() {
    mateu.run(orders("place"), Map.of("X-Mateu-Correlation-Id", "corr-123"));
    var span = onlyMateuSpan();
    assertThat(span.getName()).isEqualTo("mateu place /obs/orders");
    assertThat(attr(span, "mateu.route")).isEqualTo("/obs/orders");
    assertThat(attr(span, "mateu.route.template")).isEqualTo("/obs/orders");
    assertThat(attr(span, "mateu.action")).isEqualTo("place");
    assertThat(attr(span, "mateu.view")).isEqualTo(Orders.class.getName());
    assertThat(attr(span, "mateu.outcome")).isEqualTo("ok");
    assertThat(attr(span, "mateu.correlation_id")).isEqualTo("corr-123");
  }

  @Test
  void aUserErrorAndABugAreToldApart() {
    mateu.run(orders("outOfStock"));
    assertThat(attr(onlyMateuSpan(), "mateu.outcome")).isEqualTo("user_error");
    SPANS.reset();

    mateu.run(orders("bug"));
    var span = onlyMateuSpan();
    assertThat(attr(span, "mateu.outcome")).isEqualTo("error");
    assertThat(attr(span, "error.type")).isEqualTo(IllegalStateException.class.getName());
    assertThat(attr(span, "mateu.error.reference")).isNotBlank();
    assertThat(span.getStatus().getStatusCode())
        .isEqualTo(io.opentelemetry.api.trace.StatusCode.ERROR);
    // the audit event carries the same reference the user was shown
    var event = EVENTS.get(EVENTS.size() - 1);
    assertThat(event.outcome()).isEqualTo(ActionOutcome.ERROR);
    assertThat(event.errorReference()).isEqualTo(attr(span, "mateu.error.reference"));
  }

  @Test
  void aRefusedActionIsForbiddenAndMeasuredUnderOtherNotItsName() {
    assertThatThrownBy(() -> mateu.run(orders("no-such-action-xyz")))
        .isInstanceOf(RuntimeException.class);
    var span = onlyMateuSpan();
    assertThat(attr(span, "mateu.outcome")).isEqualTo("forbidden");
    assertThat(EVENTS.get(EVENTS.size() - 1).outcome()).isEqualTo(ActionOutcome.FORBIDDEN);
    // the metric never takes what a caller wrote for a refused request
    assertThat(durationPoints())
        .noneMatch(
            point ->
                "no-such-action-xyz"
                    .equals(point.getAttributes().get(AttributeKey.stringKey("mateu.action"))));
  }

  @Test
  void theDurationHistogramIsByRouteTemplateActionAndOutcome() {
    mateu.run(orders("place"));
    assertThat(durationPoints())
        .anyMatch(
            point ->
                "/obs/orders"
                        .equals(
                            point
                                .getAttributes()
                                .get(AttributeKey.stringKey("mateu.route.template")))
                    && "place"
                        .equals(point.getAttributes().get(AttributeKey.stringKey("mateu.action")))
                    && "ok"
                        .equals(
                            point.getAttributes().get(AttributeKey.stringKey("mateu.outcome"))));
    mateu.run(orders("bug"));
    var errors =
        METRICS.collectAllMetrics().stream()
            .filter(m -> m.getName().equals("mateu.request.errors"))
            .findFirst()
            .orElseThrow();
    assertThat(errors.getLongSumData().getPoints())
        .anyMatch(
            point ->
                "bug".equals(point.getAttributes().get(AttributeKey.stringKey("mateu.action"))));
  }

  private static List<? extends io.opentelemetry.sdk.metrics.data.PointData> durationPoints() {
    return METRICS.collectAllMetrics().stream()
        .filter(m -> m.getName().equals("mateu.request.duration"))
        .map(MetricData::getHistogramData)
        .flatMap(data -> data.getPoints().stream())
        .toList();
  }

  @Test
  void theAuditEventSaysWhoWhatAndWhenButNeverTheState() {
    mateu.run(orders("place"), TestIdentities.headersWithRoles("clerk"));
    var event = EVENTS.get(EVENTS.size() - 1);
    assertThat(event.route()).isEqualTo("/obs/orders");
    assertThat(event.actionId()).isEqualTo("place");
    assertThat(event.view()).isEqualTo(Orders.class.getName());
    assertThat(event.outcome()).isEqualTo(ActionOutcome.OK);
    assertThat(event.caller().roles()).containsExactly("clerk");
    assertThat(event.at()).isNotNull();
    assertThat(event.correlationId()).isNotBlank();
    assertThat(event.reservedAction()).isFalse();
    // nothing the user typed travels: the record has no slot for it, and its text shows none
    assertThat(event.toString()).doesNotContain("secret note");
  }

  @Test
  void aCrudDeleteNamesTheRecordsItDeleted() {
    mateu.run(
        items("delete", Map.of("crud_selected_items", List.of(Map.of("id", "2", "name", "two")))));
    var event = EVENTS.get(EVENTS.size() - 1);
    assertThat(event.actionId()).isEqualTo("delete");
    assertThat(event.recordIds()).containsExactly("2");
    assertThat(
            SPANS.getFinishedSpanItems().stream()
                .filter(s -> s.getName().startsWith("mateu delete"))
                .findFirst()
                .orElseThrow()
                .getAttributes()
                .get(AttributeKey.longKey("mateu.record.count")))
        .isEqualTo(1L);
  }

  @Test
  void aBulkActionNamesTheSelectedRecords() {
    mateu.run(
        items(
            "action-on-row-archive",
            Map.of(
                "crud_selected_items",
                List.of(Map.of("id", "1", "name", "one"), Map.of("id", "2", "name", "two")))));
    assertThat(EVENTS.get(EVENTS.size() - 1).recordIds()).containsExactly("1", "2");
  }

  @Test
  void aFailingListenerDoesNotFailTheRequest() {
    // Broken throws on every call: the answer still arrives and the recording listener still hears
    var increment = mateu.run(orders("place"));
    assertThat(increment.messages()).extracting(m -> m.text()).contains("placed");
    assertThat(EVENTS).isNotEmpty();
  }

  @Test
  void aProxiedRestCallIsAChildSpanNamedByItsTemplateNeverItsResolvedUrl() {
    mateu.run(
        RunActionRqDto.builder()
            .route("/obs/orders")
            .actionId("__restfetch__")
            .serverSideType(Orders.class.getName())
            .parameters(Map.of("_sourceKind", "action", "_sourceId", "reserve"))
            .componentState(Map.of("sku", "SKU-77"))
            .build());
    var proxy =
        SPANS.getFinishedSpanItems().stream()
            .filter(s -> s.getName().equals("mateu rest_proxy POST"))
            .findFirst()
            .orElseThrow();
    var request =
        SPANS.getFinishedSpanItems().stream()
            .filter(s -> s.getName().startsWith("mateu __restfetch__"))
            .findFirst()
            .orElseThrow();
    // nested under the request's span, by the url TEMPLATE without its query (no query, no sku)
    assertThat(proxy.getParentSpanId()).isEqualTo(request.getSpanId());
    assertThat(proxy.getTraceId()).isEqualTo(request.getTraceId());
    assertThat(attr(proxy, "url.template")).isEqualTo(UPSTREAM + "/stock/${state.sku}");
    assertThat(proxy.getAttributes().toString()).doesNotContain("SKU-77").doesNotContain("k-123");
    assertThat(proxy.getAttributes().get(AttributeKey.longKey("http.response.status_code")))
        .isEqualTo(204L);
  }

  @Test
  void aMicroFrontendResolutionIsAChildSpanWithItsOutcome() {
    io.mateu.core.infra.observability.MicroFrontendSpans.record(
        new io.mateu.core.testutil.FakeHttpRequest(RunActionRqDto.builder().build()),
        new io.mateu.uidl.remote.MicroFrontendResolutionEvent(
            "shop",
            "http://shop/mateu/v3/sync/cart",
            null,
            120,
            io.mateu.uidl.remote.MicroFrontendResolutionEvent.Outcome.TIMEOUT,
            "client",
            "corr-9",
            null));
    var span =
        SPANS.getFinishedSpanItems().stream()
            .filter(s -> s.getName().equals("mateu microfrontend shop"))
            .findFirst()
            .orElseThrow();
    assertThat(attr(span, "mateu.remote.id")).isEqualTo("shop");
    assertThat(attr(span, "mateu.microfrontend.outcome")).isEqualTo("timeout");
    assertThat(attr(span, "mateu.microfrontend.degraded_to")).isEqualTo("client");
    assertThat(span.getStatus().getStatusCode())
        .isEqualTo(io.opentelemetry.api.trace.StatusCode.ERROR);
    assertThat(span.getEndEpochNanos() - span.getStartEpochNanos()).isGreaterThan(0);
  }
}
