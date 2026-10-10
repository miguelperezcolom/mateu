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
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * The native MCP endpoint ({@code POST /mateu/mcp}) on WebFlux — the same framework-neutral {@link
 * McpEndpoint} the other adapters serve. OFF by default; enable with {@code
 * mateu.mcp.enabled=true}.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
@ConditionalOnBean(MateuService.class)
@ConditionalOnProperty(name = McpEndpoint.ENABLED_PROPERTY, havingValue = "true")
public class MateuMcpWebFluxAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuMcpRoutes(MateuService service) {
    var mcp = new McpEndpoint(service);
    return RouterFunctions.route().POST(McpEndpoint.PATH, request -> handle(request, mcp)).build();
  }

  private static Mono<ServerResponse> handle(ServerRequest request, McpEndpoint mcp) {
    return request
        .bodyToMono(String.class)
        .defaultIfEmpty("")
        // McpService blocks on the screens it runs: keep it off the event loop.
        .publishOn(Schedulers.boundedElastic())
        .map(
            body -> {
              try {
                var response =
                    mcp.handle(
                        body,
                        rq ->
                            new SpringHttpRequest(request.exchange().getRequest())
                                .storeRunActionRqDto(rq));
                return java.util.Optional.ofNullable(response);
              } catch (Exception e) {
                throw new IllegalStateException(e);
              }
            })
        .flatMap(
            response ->
                response.isEmpty()
                    ? ServerResponse.accepted().build()
                    : ServerResponse.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(response.get()));
  }
}
