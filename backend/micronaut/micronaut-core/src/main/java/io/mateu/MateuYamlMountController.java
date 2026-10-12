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
 * The YAML-mount API ({@link YamlMounts}) on Micronaut: the sync/SSE endpoints and the mobile
 * manifest of every {@code type: UI} mount, served NEXT to the generated {@code @UI} controllers
 * (only a base path a class already serves is left to the class). The mounts' SPA shell is {@link
 * MateuYamlMountIndexController}, a separate bean because a ROOT {@code @UI}'s generated catch-all
 * index already answers every path — the YAML deep links included ({@link
 * YamlMounts#deepLinkIndex}) — while this API has no such stand-in: with a root {@code @UI} the
 * mount's own {@code POST <base>/mateu/v3/…} answered 405 and its shell never rendered.
 */
@Controller
@Requires(condition = MateuYamlMountController.Present.class)
public class MateuYamlMountController {

  /** A {@code type: UI} mount on the classpath. */
  public static class Present implements Condition {
    @Override
    public boolean matches(ConditionContext context) {
      return YamlMounts.present(context.getBeanContext().getClassLoader());
    }
  }

  /**
   * {@link Present} and no generated ROOT Mateu controller: a root {@code @UI}'s catch-all index
   * and the YAML shell's would be equally specific, and that root index answers the YAML mounts'
   * deep links itself ({@link YamlMounts#deepLinkIndex}).
   */
  public static class NoRootUi implements Condition {
    @Override
    public boolean matches(ConditionContext context) {
      return new Present().matches(context)
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

  /** The mounts this deployment serves as YAML (a base path a class serves is left to it). */
  public List<YamlMounts.Mount> mounts() {
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

  // client-log is excluded: served next to the generated controllers, this catch-all would be
  // Micronaut's pick for a class's POST <base>/mateu/v3/client-log (both match, and only this one
  // explicitly consumes JSON — the generated route consumes ALL) and answer it empty, a 404.
  @Post("/{+path:(?!.*mateu/v3/sse/)(?!.*mateu/v3/client-log$).*mateu/v3/.*}")
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
