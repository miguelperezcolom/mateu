package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.YamlMounts;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.micronaut.context.annotation.Requires;
import io.micronaut.context.condition.Condition;
import io.micronaut.context.condition.ConditionContext;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.Produces;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import java.util.List;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * The YAML-mount surface ({@link YamlMounts}) on Micronaut: an SPA shell and a sync/SSE endpoint
 * per {@code type: UI} mount, for a deployment with no Java {@code @UI}. Only exists when the
 * classpath declares such a mount AND there is no generated controller (exactly like the Spring
 * adapters, which stand down as soon as a {@code @UI} exists).
 */
@Controller
@Requires(condition = MateuYamlMountController.Present.class)
public class MateuYamlMountController {

  /**
   * A {@code type: UI} mount on the classpath and no generated ROOT Mateu controller. The YAML
   * mounts are served next to the {@code @UI} classes; only a root {@code @UI} keeps this
   * controller out, because its catch-all index and this one would be equally specific — that root
   * index answers the YAML mounts' deep links itself ({@link YamlMounts#deepLinkIndex}).
   */
  public static class Present implements Condition {
    @Override
    public boolean matches(ConditionContext context) {
      var classLoader = context.getBeanContext().getClassLoader();
      return YamlMounts.present(classLoader)
          && context.getBeanContext().getBeanDefinitions(MateuController.class).stream()
              .noneMatch(
                  definition ->
                      definition
                          .stringValue(io.micronaut.http.annotation.Controller.class)
                          .map(path -> "/mateu".equals(path) || "mateu".equals(path))
                          .orElse(false));
    }
  }

  private final MateuService service;
  private final RouteRegistry routeRegistry;
  private final YamlAppLoader yamlAppLoader;
  private volatile List<YamlMounts.Mount> mounts;

  public MateuYamlMountController(
      MateuService service, RouteRegistry routeRegistry, YamlAppLoader yamlAppLoader) {
    this.service = service;
    this.routeRegistry = routeRegistry;
    this.yamlAppLoader = yamlAppLoader;
  }

  private List<YamlMounts.Mount> mounts() {
    if (mounts == null) {
      // served next to the @UI classes: a base path a class already serves is left to it
      mounts =
          YamlMounts.notServedByClasses(
              YamlMounts.mounts(routeRegistry, yamlAppLoader),
              io.mateu.uidl.di.MateuBeanProvider.isInitialized()
                  ? io.mateu.uidl.di.MateuBeanProvider.getBeans(MateuController.class).stream()
                      .map(MateuController::getBaseUrl)
                      .toList()
                  : List.of());
    }
    return mounts;
  }

  @Get(
      uris = {"/", "/{+path:(?!.*mateu/v3/manifest$)[^.]*}"},
      produces = MediaType.TEXT_HTML)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> index(@PathVariable("path") @Nullable String path) {
    String requested = "/" + (path == null ? "" : path);
    YamlMounts.Mount best = null;
    for (var mount : mounts()) {
      var spa = mount.spaPath();
      boolean owns =
          "/".equals(spa)
              || requested.equals(spa)
              || (requested.startsWith(spa + "/") && !requested.contains("/mateu/"));
      if (owns && (best == null || spa.length() > best.spaPath().length())) {
        best = mount;
      }
    }
    if (best == null || requested.contains("/mateu/")) {
      return HttpResponse.status(HttpStatus.NOT_FOUND);
    }
    return HttpResponse.ok(best.indexHtml()).contentType(MediaType.TEXT_HTML_TYPE);
  }

  /**
   * The mobile app's manifest ({@link io.mateu.core.infra.MobileManifest}) of the mount. Produces
   * ALL: a browser asking for HTML still gets the JSON, never a 406 nor the index.
   */
  @Get(uri = "/{+path:.*mateu/v3/manifest}", produces = MediaType.ALL)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> manifest(@PathVariable("path") String path) {
    var requested = "/" + path;
    var mount = YamlMounts.mountForApiPath(mounts(), requested);
    if (mount == null) {
      return HttpResponse.status(HttpStatus.NOT_FOUND);
    }
    var response =
        HttpResponse.ok(YamlMounts.manifestJson(routeRegistry, yamlAppLoader, mount.basePath()));
    io.mateu.core.infra.MobileManifest.HEADERS.forEach(
        (name, value) -> response.header(name, value));
    return response.contentType(MediaType.APPLICATION_JSON_TYPE);
  }

  @Post("/{+path:(?!.*mateu/v3/sse/).*mateu/v3/.*}")
  public Mono<UIIncrementDto> sync(
      @PathVariable("path") String path, @Body RunActionRqDto rq, HttpRequest<?> request)
      throws Throwable {
    var mount = YamlMounts.mountForApiPath(mounts(), request.getPath());
    if (mount == null) {
      return Mono.empty();
    }
    return service
        .runAction(
            mount.basePath(),
            YamlMounts.mountRequest(mount.basePath(), rq),
            mount.basePath(),
            requestOf(request, rq, mount))
        .next();
  }

  @Produces(MediaType.TEXT_EVENT_STREAM)
  @Post("/{+path:.*mateu/v3/sse/.*}")
  public Flux<UIIncrementDto> sse(
      @PathVariable("path") String path, @Body RunActionRqDto rq, HttpRequest<?> request)
      throws Throwable {
    var mount = YamlMounts.mountForApiPath(mounts(), request.getPath());
    if (mount == null) {
      return Flux.empty();
    }
    return service.runAction(
        mount.basePath(),
        YamlMounts.mountRequest(mount.basePath(), rq),
        mount.basePath(),
        requestOf(request, rq, mount));
  }

  private static io.mateu.uidl.interfaces.HttpRequest requestOf(
      HttpRequest<?> request, RunActionRqDto rq, YamlMounts.Mount mount) {
    var httpRequest = new MicronautHttpRequest(request).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", mount.basePath());
    return httpRequest;
  }
}
