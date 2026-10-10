package io.mateu.mcp;

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.mcp.McpEndpoint;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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
 * JSON-RPC 2.0 message (MCP Streamable HTTP) and answers it through the framework-neutral {@link
 * McpEndpoint} (which reuses {@link MateuService} in-process).
 *
 * <p>OFF by default — enable with {@code mateu.mcp.enabled=true}: the endpoint lets any caller
 * drive every screen programmatically, which an application must choose to expose. RBAC is enforced
 * by {@code MateuService} over the request's JWT — the {@link SpringHttpRequest} wraps the servlet
 * request, so {@code @EyesOnly}/{@code @ReadOnlyUnless} apply exactly as on the sync endpoint; an
 * agent never sees what its token may not.
 *
 * <p>A functional route (no {@code @Controller} stereotype), on a distinct path from the generated
 * {@code /mateu/v3/**} controllers, so it coexists with them. Registered for the root mount.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnBean(MateuService.class)
@ConditionalOnProperty(name = McpEndpoint.ENABLED_PROPERTY, havingValue = "true")
public class MateuMcpAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuMcpRoutes(MateuService service) {
    var mcp = new McpEndpoint(service);
    return RouterFunctions.route().POST(McpEndpoint.PATH, request -> handle(request, mcp)).build();
  }

  private static ServerResponse handle(ServerRequest request, McpEndpoint mcp) throws Exception {
    // The body is read as a String and (de)serialized with Mateu's own (Jackson 2) wire mapper:
    // Spring's default HTTP converter is on a different Jackson and cannot bind a com.fasterxml
    // JsonNode.
    String response =
        mcp.handle(
            request.body(String.class),
            rq -> new SpringHttpRequest(request.servletRequest()).storeRunActionRqDto(rq));
    if (response == null) {
      // A JSON-RPC notification has no response (MCP: 202 Accepted, empty body).
      return ServerResponse.accepted().build();
    }
    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(response);
  }
}
