package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.mcp.McpEndpoint;
import io.micronaut.context.annotation.Requires;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;

/**
 * The native MCP endpoint ({@code POST /mateu/mcp}) on Micronaut — the framework-neutral {@link
 * McpEndpoint} every adapter serves. OFF by default; enable with {@code mateu.mcp.enabled=true}.
 */
@Controller
@Requires(property = McpEndpoint.ENABLED_PROPERTY, value = "true")
public class MateuMcpController {

  private final McpEndpoint mcp;

  public MateuMcpController(MateuService service) {
    this.mcp = new McpEndpoint(service);
  }

  @Post(value = McpEndpoint.PATH, consumes = MediaType.ALL, produces = MediaType.APPLICATION_JSON)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> handle(@Body @Nullable String body, HttpRequest<?> request)
      throws Exception {
    String response =
        mcp.handle(
            body == null ? "" : body,
            rq -> new MicronautHttpRequest(request).storeRunActionRqDto(rq));
    if (response == null) {
      return HttpResponse.accepted();
    }
    return HttpResponse.ok(response).contentType(MediaType.APPLICATION_JSON_TYPE);
  }
}
