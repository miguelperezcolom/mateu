package io.mateu.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.mcp.McpJsonRpc;
import io.mateu.core.application.mcp.McpService;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Serves the native Model Context Protocol endpoint — so a Mateu app is <em>also</em> an MCP: any
 * agent can discover and operate its screens with no sidecar. {@code POST /mateu/mcp} takes a
 * JSON-RPC 2.0 message (MCP Streamable HTTP), delegates to {@link McpJsonRpc} + {@link McpService}
 * (which reuse {@link MateuService} in-process) and returns the JSON-RPC response.
 *
 * <p>RBAC is enforced by {@code MateuService} over the request's JWT — the {@link
 * SpringHttpRequest} wraps the servlet request, so {@code @EyesOnly}/{@code @ReadOnlyUnless} apply
 * exactly as on the sync endpoint; an agent never sees what its token may not.
 *
 * <p>Additive: a functional route (no {@code @Controller} stereotype), on a distinct path from the
 * generated {@code /mateu/v3/**} controllers, so it coexists with them. Registered for the root
 * mount ({@code baseUrl == ""}); per-mount MCP endpoints are a follow-up (see {@code
 * design/riu-agent-operability-plan.md}).
 */
@AutoConfiguration
// Only where there is something to serve: a servlet web app with Mateu's service in it. An app that
// has mvc-core on its classpath but runs without the web layer — an embedded engine, a batch job, a
// test context — failed to start on the MateuService this route needs.
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnBean(MateuService.class)
public class MateuMcpAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuMcpRoutes(
      MateuService service, ObjectMapper objectMapper) {
    var mcp = new McpService(service, objectMapper);
    return RouterFunctions.route()
        .POST("/mateu/mcp", request -> handle(request, mcp, objectMapper, ""))
        .build();
  }

  private static ServerResponse handle(
      ServerRequest request, McpService mcp, ObjectMapper objectMapper, String baseUrl)
      throws Exception {
    // Read/write the JSON-RPC body as a String and (de)serialize with Mateu's own (Jackson 2)
    // ObjectMapper: Spring's default HTTP converter is on a different Jackson and cannot bind a
    // com.fasterxml JsonNode. This keeps the whole MCP payload on one Jackson, like the projection.
    JsonNode message = objectMapper.readTree(request.body(String.class));
    McpService.HttpRequestFactory requests =
        rq -> {
          var httpRequest = new SpringHttpRequest(request.servletRequest()).storeRunActionRqDto(rq);
          httpRequest.setAttribute("uiId", "");
          httpRequest.setAttribute("baseUrl", baseUrl);
          return httpRequest;
        };
    JsonNode response = McpJsonRpc.handle(message, mcp, baseUrl, requests, objectMapper);
    if (response == null) {
      // A JSON-RPC notification has no response (MCP: 202 Accepted, empty body).
      return ServerResponse.accepted().build();
    }
    return ServerResponse.ok()
        .contentType(MediaType.APPLICATION_JSON)
        .body(objectMapper.writeValueAsString(response));
  }
}
