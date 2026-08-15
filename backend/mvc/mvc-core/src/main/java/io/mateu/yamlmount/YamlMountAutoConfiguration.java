package io.mateu.yamlmount;

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.InputStreamReader;
import io.mateu.core.infra.MateuController;
import io.mateu.dtos.RunActionRqDto;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Contributes the HTTP surface — an SPA shell and a sync endpoint per mount — for a deployment
 * whose UIs are defined entirely in YAML ({@code type: UI} files), so it needs NO Java beyond the
 * Spring Boot entry point. The annotation processor generates these per {@code @UI} class; a
 * class-less deployment has none, and this fills the gap for every discovered mount at its own
 * {@code basePath}.
 *
 * <p>Gated by {@link YamlMountCondition} (there is at least one {@code type: UI} mount) and a
 * class-level {@link ConditionalOnMissingBean} on {@link MateuController} — so the moment any
 * generated controller exists (a Java {@code @UI} in the same deployment), this stands down.
 *
 * <p>The endpoints are a {@link RouterFunction}, not annotated controllers: a functional route is
 * picked up by its {@code @Bean} type regardless of package or component scanning, and needs no
 * {@code @Controller} stereotype (which would get the class component-scanned AND registered here —
 * a duplicate mapping).
 */
@AutoConfiguration
@Conditional(YamlMountCondition.class)
@ConditionalOnMissingBean(MateuController.class)
public class YamlMountAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuYamlMountRoutes(
      MateuService service, RouteRegistry routeRegistry, YamlAppLoader yamlAppLoader) {
    var builder = RouterFunctions.route();
    for (var mount : routeRegistry.mounts()) {
      var basePath = mount.basePath(); // "" for a root mount, e.g. "back-office" otherwise
      var spaPath = basePath.isEmpty() ? "/" : "/" + basePath;
      var syncPrefix = basePath.isEmpty() ? "/mateu" : "/" + basePath + "/mateu";
      var title = titleOf(routeRegistry, yamlAppLoader, basePath);
      builder
          .GET(
              spaPath,
              request ->
                  ServerResponse.ok()
                      .contentType(MediaType.TEXT_HTML)
                      .body(indexHtml(basePath, title)))
          .POST(syncPrefix + "/v3/sse/**", request -> sse(service, request, basePath))
          .POST(syncPrefix + "/v3/**", request -> sync(service, request, basePath));
    }
    return builder.build();
  }

  private static String titleOf(
      RouteRegistry routeRegistry, YamlAppLoader appLoader, String basePath) {
    var definition = routeRegistry.rootDefinitionFor(basePath);
    var shell = appLoader.load(definition);
    return shell != null && shell.title() != null ? shell.title() : "Mateu";
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

  /**
   * The SPA shell HTML with a {@code <mateu-ui baseUrl="{basePath}">} injected; the SPA then POSTs
   * {@code /{basePath}/mateu/v3/**} and the YAML-defined mount answers. The initial page title
   * comes from the mount's app shell definition (the SPA overrides it per route once loaded).
   */
  private static String indexHtml(String basePath, String title) {
    String html =
        InputStreamReader.readFromClasspath(
            YamlMountAutoConfiguration.class, "/static/_index.html");
    html = html.replaceAll("<!-- AQUIFAVICON -->", "");
    html = html.replaceAll("AQUIELTITULODELAPAGINA", title);
    return html.substring(0, html.indexOf("<!-- AQUIUI -->"))
        + "<mateu-ui baseUrl=\""
        + basePath
        + "\" pathPrefix=\"\" style=\"width:100%;height:100vh;\"></mateu-ui>"
        + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
  }
}
