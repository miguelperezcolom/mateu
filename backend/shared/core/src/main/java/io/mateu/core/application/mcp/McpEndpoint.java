package io.mateu.core.application.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.function.Function;

/**
 * The HTTP side of the native Model Context Protocol endpoint ({@code POST /mateu/mcp}), framework
 * neutral, so every adapter serves it the same way: a JSON-RPC 2.0 message in, the JSON-RPC
 * response out (or nothing — 202 — for a notification).
 *
 * <p>OFF by default: an MCP endpoint lets any caller holding a valid token drive every screen of
 * the app programmatically, which an application has to choose to expose. Enable it with {@value
 * #ENABLED_PROPERTY}{@code =true}. RBAC is still enforced by {@link MateuService} over the
 * request's token, exactly as on the sync endpoint.
 */
public final class McpEndpoint {

  /** Property that turns the endpoint on (it is off unless set to true). */
  public static final String ENABLED_PROPERTY = "mateu.mcp.enabled";

  /** Where it is served (the root mount). */
  public static final String PATH = "/mateu/mcp";

  /** HTTP 202, the answer to a JSON-RPC notification. */
  public static final int ACCEPTED = 202;

  private final McpService mcp;
  private final ObjectMapper objectMapper;
  private final String baseUrl;

  public McpEndpoint(MateuService service) {
    this(service, WireMapper.shared(), "");
  }

  public McpEndpoint(MateuService service, ObjectMapper objectMapper, String baseUrl) {
    this.objectMapper = objectMapper;
    this.mcp = new McpService(service, objectMapper);
    this.baseUrl = baseUrl;
  }

  /**
   * Handles one message.
   *
   * @param body the JSON-RPC message
   * @param requests builds the adapter's {@link HttpRequest} for each internal run (it must carry
   *     the caller's token); {@code uiId}/{@code baseUrl} attributes are set here
   * @return the JSON response body, or null for a notification (answer 202, empty body)
   */
  public String handle(String body, Function<RunActionRqDto, HttpRequest> requests)
      throws Exception {
    JsonNode message = objectMapper.readTree(body);
    McpService.HttpRequestFactory factory =
        rq -> {
          var httpRequest = requests.apply(rq);
          httpRequest.setAttribute("uiId", "");
          httpRequest.setAttribute("baseUrl", baseUrl);
          return httpRequest;
        };
    JsonNode response = McpJsonRpc.handle(message, mcp, baseUrl, factory, objectMapper);
    return response == null ? null : objectMapper.writeValueAsString(response);
  }
}
