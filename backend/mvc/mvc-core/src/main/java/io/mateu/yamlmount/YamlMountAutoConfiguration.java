package io.mateu.yamlmount;

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
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
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Contributes the HTTP surface — the SPA shell at {@code /} and the sync endpoint at {@code /mateu}
 * — for a mount defined entirely in YAML, so it needs NO Java at all beyond the Spring Boot entry
 * point. The annotation processor generates these per {@code @UI} class; a class-less mount has
 * none, and this fills the gap.
 *
 * <p>Gated two ways: {@link YamlMountCondition} (there is a {@code routes.yaml} with an {@code
 * app:} block to serve) and a class-level {@link ConditionalOnMissingBean} on {@link
 * MateuController} — so the moment ANY generated controller exists (a Java {@code @App} in the same
 * deployment), this stands down and the generated ones win. Being an auto-configuration (loaded
 * after user beans), the missing-bean check reliably sees the generated controllers.
 *
 * <p>The endpoints are registered as a {@link RouterFunction} rather than an annotated controller
 * on purpose: a functional route is picked up by its {@code @Bean} type regardless of package or
 * component scanning, and needs no {@code @Controller} stereotype (which would get the class
 * component-scanned AND registered here — a duplicate {@code /mateu/v3/**} mapping). {@code
 * uiId}/{@code baseUrl} are empty: route resolution drives everything from the request for a root
 * mount.
 */
@AutoConfiguration
@Conditional(YamlMountCondition.class)
@ConditionalOnMissingBean(MateuController.class)
public class YamlMountAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuYamlMountRoutes(
      MateuService service, YamlAppLoader yamlAppLoader) {
    return RouterFunctions.route()
        .GET(
            "/",
            request ->
                ServerResponse.ok().contentType(MediaType.TEXT_HTML).body(indexHtml(yamlAppLoader)))
        // The SSE route must come before the catch-all so LongTask streaming is not swallowed by
        // it.
        .POST("/mateu/v3/sse/**", request -> sse(service, request))
        .POST("/mateu/v3/**", request -> sync(service, request))
        .build();
  }

  private static ServerResponse sync(
      MateuService service, org.springframework.web.servlet.function.ServerRequest request)
      throws Exception {
    var rq = request.body(RunActionRqDto.class);
    var httpRequest = requestOf(request, rq);
    io.mateu.dtos.UIIncrementDto increment;
    try {
      increment = service.runAction("", rq, "", httpRequest).next().block();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
    return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).body(increment);
  }

  private static ServerResponse sse(
      MateuService service, org.springframework.web.servlet.function.ServerRequest request)
      throws Exception {
    var rq = request.body(RunActionRqDto.class);
    var httpRequest = requestOf(request, rq);
    return ServerResponse.sse(
        sseBuilder -> {
          try {
            service
                .runAction("", rq, "", httpRequest)
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
      org.springframework.web.servlet.function.ServerRequest request, RunActionRqDto rq) {
    var httpRequest = new SpringHttpRequest(request.servletRequest()).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", "");
    return httpRequest;
  }

  /**
   * The SPA shell HTML with a root {@code <mateu-ui baseUrl="">} injected; the SPA then POSTs
   * {@code /mateu/v3/**} with route {@code ""} and the YAML-defined app shell answers. The initial
   * page title comes from the {@code app:} block (the SPA overrides it per route once loaded).
   */
  private static String indexHtml(YamlAppLoader yamlAppLoader) {
    var app = yamlAppLoader.app();
    var title = app != null && app.title() != null ? app.title() : "Mateu";
    String html =
        InputStreamReader.readFromClasspath(
            YamlMountAutoConfiguration.class, "/static/_index.html");
    html = html.replaceAll("<!-- AQUIFAVICON -->", "");
    html = html.replaceAll("AQUIELTITULODELAPAGINA", title);
    return html.substring(0, html.indexOf("<!-- AQUIUI -->"))
        + "<mateu-ui baseUrl=\"\" pathPrefix=\"\" style=\"width:100%;height:100vh;\"></mateu-ui>"
        + html.substring(html.indexOf("<!-- HASTAAQUIUI -->"));
  }
}
