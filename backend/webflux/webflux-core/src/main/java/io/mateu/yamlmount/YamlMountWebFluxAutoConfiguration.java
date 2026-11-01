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
 * {@code type: UI} mount, served next to the Java {@code @UI}s of the deployment (a base path a
 * class already serves is left to the class), exactly like the Spring MVC one.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
@Conditional(YamlMountWebFluxAutoConfiguration.Present.class)
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
      MateuService service,
      RouteRegistry routeRegistry,
      YamlAppLoader yamlAppLoader,
      org.springframework.beans.factory.ObjectProvider<MateuController> controllers) {
    var builder = RouterFunctions.route();
    // served next to the @UI classes: only a path a class already serves is left to it
    var mounts =
        YamlMounts.notServedByClasses(
            YamlMounts.mounts(routeRegistry, yamlAppLoader),
            controllers.orderedStream().map(MateuController::getBaseUrl).toList());
    if (mounts.isEmpty()) {
      return RouterFunctions.route(request -> false, request -> ServerResponse.notFound().build());
    }
    for (var mount : mounts) {
      var basePath = mount.basePath();
      builder
          .GET(mount.spaPath(), request -> index(mount))
          .GET(
              mount.apiPrefix() + "/v3/manifest",
              request -> manifest(YamlMounts.manifestJson(routeRegistry, yamlAppLoader, basePath)))
          .GET(
              mount.apiPrefix() + "/v3/pwa/{file}",
              request ->
                  pwa(
                      YamlMounts.pwaAsset(
                          routeRegistry, yamlAppLoader, basePath, request.pathVariable("file"))))
          .POST(mount.apiPrefix() + "/v3/sse/**", request -> sse(service, request, basePath))
          .POST(mount.apiPrefix() + "/v3/**", request -> sync(service, request, basePath));
      if (!basePath.isEmpty()) {
        builder.route(
            RequestPredicates.GET(mount.spaPath() + "/**")
                .and(
                    request ->
                        !io.mateu.core.infra.SpaFallback.isAsset(request.path())
                            && !request.path().contains("/mateu/")
                            // a navigation, not a data fetch (see SpaFallback.acceptsHtml)
                            && io.mateu.core.infra.SpaFallback.acceptsHtml(
                                request.headers().firstHeader("Accept"))),
            request -> index(mount));
      }
    }
    return builder.build();
  }

  private static Mono<ServerResponse> index(YamlMounts.Mount mount) {
    return ServerResponse.ok().contentType(MediaType.TEXT_HTML).bodyValue(mount.indexHtml());
  }

  /** The mobile app's manifest ({@link io.mateu.core.infra.MobileManifest}). */
  private static Mono<ServerResponse> manifest(String json) {
    var response = ServerResponse.ok();
    io.mateu.core.infra.MobileManifest.HEADERS.forEach(
        (name, value) -> response.header(name, value));
    return response.bodyValue(json);
  }

  /** A file of the installable app ({@link io.mateu.core.infra.Pwa}), or a 404. */
  private static Mono<ServerResponse> pwa(io.mateu.core.infra.Pwa.Asset asset) {
    if (asset == null) {
      return ServerResponse.notFound().build();
    }
    var response = ServerResponse.ok();
    asset.headers().forEach((name, value) -> response.header(name, value));
    return response.bodyValue(asset.body());
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
    var springRequest = new SpringHttpRequest(request.exchange().getRequest());
    var httpRequest = springRequest.storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", baseUrl);
    return SpringHttpRequest.withPrincipalOf(
        request.exchange(),
        springRequest,
        () ->
            service.runAction(baseUrl, YamlMounts.mountRequest(baseUrl, rq), baseUrl, httpRequest));
  }
}
