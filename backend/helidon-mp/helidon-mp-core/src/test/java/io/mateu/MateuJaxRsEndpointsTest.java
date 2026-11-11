package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.helidon.common.socket.PeerInfo;
import io.helidon.webserver.http.ServerRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.YamlMounts;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.SecurityContext;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;

/**
 * MCP and the YAML mounts' API served through Jersey ({@link MateuJaxRsEndpoints}), for a caller
 * only JAX-RS authenticates: the JAX-RS principal reaches Mateu, a login the app requires is
 * enforced, and anything that is not an enabled endpoint or a mount answers 404.
 */
class MateuJaxRsEndpointsTest {

  static final YamlMounts.Mount MOUNT = new YamlMounts.Mount("back-office", "Back office");

  static final String RQ =
      "{\"route\": \"/orders\", \"consumedRoute\": \"\", \"actionId\": \"\","
          + " \"componentState\": {}, \"parameters\": {}, \"appState\": {}}";

  /** The routes' decisions, fixed for the test. */
  static final class Routes extends MateuHelidonRoutes {
    final boolean mcp;
    final boolean loginRequired;

    Routes(boolean mcp, boolean loginRequired) {
      this.mcp = mcp;
      this.loginRequired = loginRequired;
    }

    @Override
    public boolean mcpEnabled() {
      return mcp;
    }

    @Override
    public boolean authenticationRequired() {
      return loginRequired;
    }

    @Override
    public List<YamlMounts.Mount> yamlMounts() {
      return List.of(MOUNT);
    }
  }

  /** Records what Mateu was asked, answering the given increments. */
  static final class RecordingService implements MateuService {
    final List<HttpRequest> requests = new CopyOnWriteArrayList<>();
    final List<String> uiIds = new CopyOnWriteArrayList<>();
    final Flux<UIIncrementDto> answer;

    RecordingService(Flux<UIIncrementDto> answer) {
      this.answer = answer;
    }

    @Override
    public Flux<UIIncrementDto> runAction(
        String uiId, io.mateu.dtos.RunActionRqDto rq, String baseUrl, HttpRequest httpRequest) {
      uiIds.add(uiId);
      requests.add(httpRequest);
      return answer;
    }
  }

  static final Principal LEIA = () -> "leia";

  private static SecurityContext authenticated(Principal principal) {
    return Fakes.fake(SecurityContext.class, Map.of("getUserPrincipal", principal));
  }

  private static final SecurityContext ANONYMOUS = Fakes.fake(SecurityContext.class, Map.of());

  private static ServerRequest peer(String host) {
    return Fakes.fake(
        ServerRequest.class,
        Map.of("remotePeer", Fakes.fake(PeerInfo.class, Map.of("host", host))));
  }

  private static MateuJaxRsEndpoints endpoints(MateuService service, MateuHelidonRoutes routes) {
    var endpoints = new MateuJaxRsEndpoints();
    endpoints.service = service;
    endpoints.routes = routes;
    return endpoints;
  }

  private static UIIncrementDto page(String title) {
    return UIIncrementDto.builder().appData(Map.of("title", title)).build();
  }

  @Test
  void mcpIsNotServedUnlessEnabled() throws Exception {
    var response =
        endpoints(new RecordingService(Flux.empty()), new Routes(false, false))
            .mcp("{}", null, null, authenticated(LEIA), null);
    assertEquals(404, response.getStatus());
  }

  @Test
  void mcpRefusesAnAnonymousCallerWhenTheAppRequiresALogin() throws Exception {
    var endpoints = endpoints(new RecordingService(Flux.empty()), new Routes(true, true));
    assertEquals(401, endpoints.mcp("{}", null, null, ANONYMOUS, null).getStatus());
    // no SecurityContext at all is nobody too
    assertEquals(401, endpoints.mcp("{}", null, null, null, null).getStatus());
  }

  @Test
  void anMcpNotificationIsAcceptedWithNoBody() throws Exception {
    var response =
        endpoints(new RecordingService(Flux.empty()), new Routes(true, true))
            .mcp(
                "{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}",
                null,
                null,
                authenticated(LEIA),
                null);
    assertEquals(202, response.getStatus());
    assertNull(response.getEntity());
  }

  @Test
  void anMcpToolCallRunsAsTheJaxRsCallerFromItsSocketAddress() throws Exception {
    var service = new RecordingService(Flux.just(page("Orders")));
    var response =
        endpoints(service, new Routes(true, true))
            .mcp(
                "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":"
                    + "\"mateu_describe_screen\",\"arguments\":{\"route\":\"orders\"}}}",
                null,
                null,
                authenticated(LEIA),
                peer("10.0.0.7"));
    assertEquals(200, response.getStatus());
    assertTrue(((String) response.getEntity()).contains("\"id\":1"));
    assertTrue(!service.requests.isEmpty(), "the tool call never reached Mateu");
    var request = service.requests.get(0);
    assertSame(LEIA, request.getUserPrincipal());
    assertEquals("10.0.0.7", request.getRemoteAddress());
  }

  @Test
  void anAnonymousMcpCallIsServedWhenNoLoginIsRequired() throws Exception {
    var response =
        endpoints(new RecordingService(Flux.empty()), new Routes(true, false))
            .mcp("{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"ping\"}", null, null, null, null);
    assertEquals(200, response.getStatus());
  }

  @Test
  void aSyncCallOutsideEveryMountIsNotFound() throws Throwable {
    var service = new RecordingService(Flux.just(page("x")));
    var response =
        endpoints(service, new Routes(false, false))
            .yamlSync("other/mateu/v3/sync/orders", RQ, null, null, authenticated(LEIA), null);
    assertEquals(404, response.getStatus());
    assertTrue(service.requests.isEmpty());
  }

  @Test
  void aSyncCallToAMountRequiresTheLoginTheAppRequires() throws Throwable {
    var service = new RecordingService(Flux.just(page("x")));
    var response =
        endpoints(service, new Routes(false, true))
            .yamlSync("back-office/mateu/v3/sync/orders", RQ, null, null, ANONYMOUS, null);
    assertEquals(401, response.getStatus());
    assertTrue(service.requests.isEmpty());
  }

  @Test
  void aSyncCallToAMountRunsAsTheJaxRsCallerUnderTheMount() throws Throwable {
    var service = new RecordingService(Flux.just(page("Orders page")));
    var response =
        endpoints(service, new Routes(false, true))
            .yamlSync(
                "back-office/mateu/v3/sync/orders",
                RQ,
                null,
                null,
                authenticated(LEIA),
                peer("10.0.0.8"));
    assertEquals(200, response.getStatus());
    assertTrue(((String) response.getEntity()).contains("Orders page"));
    assertEquals(List.of("back-office"), service.uiIds);
    var request = service.requests.get(0);
    assertSame(LEIA, request.getUserPrincipal());
    assertEquals("back-office", request.getAttribute("baseUrl"));
    assertEquals("", request.getAttribute("uiId"));
    assertEquals("10.0.0.8", request.getRemoteAddress());
  }

  @Test
  void aStreamedCallOutsideEveryMountIsNotFound() {
    var endpoints = endpoints(new RecordingService(Flux.empty()), new Routes(false, false));
    assertThrows(
        NotFoundException.class,
        () ->
            endpoints.yamlSse(
                "other/mateu/v3/sse/orders",
                RQ,
                null,
                null,
                authenticated(LEIA),
                null,
                new JerseySseTest.RecordingSink(),
                new JerseySseTest.PlainSse()));
  }

  @Test
  void aStreamedCallToAMountRequiresTheLoginTheAppRequires() {
    var endpoints = endpoints(new RecordingService(Flux.empty()), new Routes(false, true));
    assertThrows(
        NotAuthorizedException.class,
        () ->
            endpoints.yamlSse(
                "back-office/mateu/v3/sse/orders",
                RQ,
                null,
                null,
                null,
                null,
                new JerseySseTest.RecordingSink(),
                new JerseySseTest.PlainSse()));
  }

  @Test
  void aStreamedCallToAMountSendsEachIncrementAsTheJaxRsCaller() throws Throwable {
    var service = new RecordingService(Flux.just(page("first"), page("second")));
    var sink = new JerseySseTest.RecordingSink();
    endpoints(service, new Routes(false, true))
        .yamlSse(
            "back-office/mateu/v3/sse/orders",
            RQ,
            null,
            null,
            authenticated(LEIA),
            null,
            sink,
            new JerseySseTest.PlainSse());
    assertTrue(sink.awaitClosed());
    assertEquals(2, sink.sent.size());
    assertTrue(sink.sent.get(0).contains("first"));
    assertTrue(sink.sent.get(1).contains("second"));
    assertSame(LEIA, service.requests.get(0).getUserPrincipal());
    assertEquals("back-office", service.requests.get(0).getAttribute("baseUrl"));
  }
}
