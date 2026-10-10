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

  /** A {@code type: UI} mount on the classpath and no generated Mateu controller. */
  public static class Present implements Condition {
    @Override
    public boolean matches(ConditionContext context) {
      var classLoader = context.getBeanContext().getClassLoader();
      return YamlMounts.present(classLoader)
          && context.getBeanContext().getBeanDefinitions(MateuController.class).isEmpty();
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
      mounts = YamlMounts.mounts(routeRegistry, yamlAppLoader);
    }
    return mounts;
  }

  @Get(
      uris = {"/", "/{+path:[^.]*}"},
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

  @Post("/{+path:(?!.*mateu/v3/sse/).*mateu/v3/.*}")
  public Mono<UIIncrementDto> sync(
      @PathVariable("path") String path, @Body RunActionRqDto rq, HttpRequest<?> request)
      throws Throwable {
    var mount = YamlMounts.mountForApiPath(mounts(), request.getPath());
    if (mount == null) {
      return Mono.empty();
    }
    return service
        .runAction(mount.basePath(), rq, mount.basePath(), requestOf(request, rq, mount))
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
    return service.runAction(mount.basePath(), rq, mount.basePath(), requestOf(request, rq, mount));
  }

  private static io.mateu.uidl.interfaces.HttpRequest requestOf(
      HttpRequest<?> request, RunActionRqDto rq, YamlMounts.Mount mount) {
    var httpRequest = new MicronautHttpRequest(request).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", mount.basePath());
    return httpRequest;
  }
}
