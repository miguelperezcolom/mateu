package io.mateu.yamlmount;

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.YamlMounts;
import io.mateu.dtos.RunActionRqDto;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Contributes the HTTP surface — an SPA shell and a sync endpoint per mount — for a deployment
 * whose UIs are defined entirely in YAML ({@code type: UI} files), so it needs NO Java beyond the
 * Spring Boot entry point. The annotation processor generates these per {@code @UI} class; a
 * class-less deployment has none, and this fills the gap for every discovered mount at its own
 * {@code basePath}. The surface itself is {@link YamlMounts} (core), shared by every adapter.
 *
 * <p>Gated by {@link YamlMountCondition} (there is at least one {@code type: UI} mount) and a
 * class-level {@link ConditionalOnMissingBean} on {@link MateuController} — so the moment any
 * generated controller exists (a Java {@code @UI} in the same deployment), this stands down.
 *
 * <p>The endpoints are a {@link RouterFunction}, not annotated controllers: a functional route is
 * picked up by its {@code @Bean} type regardless of package or component scanning.
 */
@AutoConfiguration
@Conditional(YamlMountCondition.class)
@ConditionalOnMissingBean(MateuController.class)
public class YamlMountAutoConfiguration {

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
        // Deep links under a nested mount answer its index (the root mount's are forwarded to "/"
        // by SpaRedirectFilter — a catch-all here would shadow the application's own handlers).
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

  private static ServerResponse index(YamlMounts.Mount mount) {
    return ServerResponse.ok().contentType(MediaType.TEXT_HTML).body(mount.indexHtml());
  }

  private static ServerResponse sync(MateuService service, ServerRequest request, String baseUrl)
      throws Exception {
    var rq = request.body(RunActionRqDto.class);
    var httpRequest = requestOf(request, rq, baseUrl);
    io.mateu.dtos.UIIncrementDto increment;
    try {
      increment = service.runAction(baseUrl, rq, baseUrl, httpRequest).next().block();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(increment);
  }

  private static ServerResponse sse(MateuService service, ServerRequest request, String baseUrl)
      throws Exception {
    var rq = request.body(RunActionRqDto.class);
    var httpRequest = requestOf(request, rq, baseUrl);
    return ServerResponse.sse(
        sseBuilder -> {
          try {
            service
                .runAction(baseUrl, rq, baseUrl, httpRequest)
                .subscribe(
                    increment -> {
                      try {
                        sseBuilder.data(increment);
                      } catch (Exception e) {
                        sseBuilder.error(e);
                      }
                    },
                    sseBuilder::error,
                    sseBuilder::complete);
          } catch (Throwable t) {
            sseBuilder.error(t);
          }
        });
  }

  private static io.mateu.uidl.interfaces.HttpRequest requestOf(
      ServerRequest request, RunActionRqDto rq, String baseUrl) {
    var httpRequest = new SpringHttpRequest(request.servletRequest()).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", baseUrl);
    return httpRequest;
  }

  /** The SPA shell HTML for a mount (kept for callers of the previous API). */
  static String indexHtml(String basePath, String title) {
    return YamlMounts.indexHtml(basePath, title);
  }
}
