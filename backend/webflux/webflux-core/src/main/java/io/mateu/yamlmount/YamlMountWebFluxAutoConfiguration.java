package io.mateu.yamlmount;

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.YamlMounts;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The YAML-mount surface ({@link YamlMounts}) on WebFlux — an SPA shell and a sync/SSE endpoint per
 * {@code type: UI} mount, for a deployment with no Java {@code @UI}. Stands down as soon as a
 * generated controller exists, exactly like the Spring MVC one.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
@Conditional(YamlMountWebFluxAutoConfiguration.Present.class)
@ConditionalOnMissingBean(MateuController.class)
public class YamlMountWebFluxAutoConfiguration {

  /** True when the classpath declares at least one {@code type: UI} mount. */
  public static class Present implements Condition {
    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
      return YamlMounts.present(context.getClassLoader());
    }
  }

  @Bean
  public RouterFunction<ServerResponse> mateuYamlMountRoutes(
      MateuService service, RouteRegistry routeRegistry, YamlAppLoader yamlAppLoader) {
    var builder = RouterFunctions.route();
    for (var mount : YamlMounts.mounts(routeRegistry, yamlAppLoader)) {
      var basePath = mount.basePath();
      builder
          .GET(mount.spaPath(), request -> index(mount))
          .POST(mount.apiPrefix() + "/v3/sse/**", request -> sse(service, request, basePath))
          .POST(mount.apiPrefix() + "/v3/**", request -> sync(service, request, basePath));
      if (!basePath.isEmpty()) {
        builder.route(
            RequestPredicates.GET(mount.spaPath() + "/**")
                .and(
                    request ->
                        !request.path().contains(".") && !request.path().contains("/mateu/")),
            request -> index(mount));
      }
    }
    return builder.build();
  }

  private static Mono<ServerResponse> index(YamlMounts.Mount mount) {
    return ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue(mount.indexHtml());
  }

  private static Mono<ServerResponse> sync(
      MateuService service, ServerRequest request, String baseUrl) {
    return request
        .bodyToMono(RunActionRqDto.class)
        .flatMap(rq -> run(service, request, rq, baseUrl).next())
        .flatMap(
            increment ->
                ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(increment));
  }

  private static Mono<ServerResponse> sse(
      MateuService service, ServerRequest request, String baseUrl) {
    return request
        .bodyToMono(RunActionRqDto.class)
        .flatMap(
            rq ->
                ServerResponse.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(
                        run(service, request, rq, baseUrl)
                            .map(increment -> ServerSentEvent.builder(increment).build()),
                        ServerSentEvent.class));
  }

  private static Flux<UIIncrementDto> run(
      MateuService service, ServerRequest request, RunActionRqDto rq, String baseUrl) {
    var httpRequest =
        new SpringHttpRequest(request.exchange().getRequest()).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", baseUrl);
    try {
      return service.runAction(baseUrl, rq, baseUrl, httpRequest);
    } catch (Throwable t) {
      return Flux.error(t);
    }
  }
}
