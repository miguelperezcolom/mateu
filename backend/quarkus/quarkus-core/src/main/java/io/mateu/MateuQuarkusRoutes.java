package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.mcp.McpEndpoint;
import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.infra.ClientErrorLog;
import io.mateu.core.infra.CorsPolicy;
import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.StaticAssetCaching;
import io.mateu.core.infra.WireMapper;
import io.mateu.core.infra.YamlMounts;
import io.mateu.core.infra.documents.DocumentDownloads;
import io.mateu.dtos.RunActionRqDto;
import io.vertx.core.http.HttpMethod;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.spi.BeanManager;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * The adapter-level HTTP surface on Quarkus, registered on the Vert.x router (ahead of Quarkus
 * REST): the {@code mateu.cors.allowed-origins} allow-list ({@link CorsPolicy}), the asset cache
 * policy ({@link StaticAssetCaching}), the renderer's error reports ({@link ClientErrorLog}), the
 * MCP endpoint ({@link McpEndpoint}, only with {@code mateu.mcp.enabled=true}) and, for a
 * deployment with no Java {@code @UI}, the YAML mounts ({@link YamlMounts}). The same contract as
 * every other adapter, each piece decided in core.
 */
@ApplicationScoped
public class MateuQuarkusRoutes {

  // Ahead of Quarkus REST (and of the static resources handler).
  private static final int EARLY = Integer.MIN_VALUE + 100;

  @Inject MateuService service;
  @Inject RouteRegistry routeRegistry;
  @Inject YamlAppLoader yamlAppLoader;
  @Inject BeanManager beanManager;

  @ConfigProperty(name = CorsPolicy.ALLOWED_ORIGINS_PROPERTY)
  Optional<String> allowedOrigins;

  @ConfigProperty(name = CorsPolicy.ALLOW_CREDENTIALS_PROPERTY, defaultValue = "false")
  String allowCredentials;

  @ConfigProperty(name = McpEndpoint.ENABLED_PROPERTY, defaultValue = "false")
  boolean mcpEnabled;

  @ConfigProperty(
      name = io.mateu.core.infra.dev.DevEndpoint.ENABLED_PROPERTY,
      defaultValue = "false")
  boolean devEnabled;

  @ConfigProperty(name = io.mateu.core.infra.dev.DevEndpoint.SPECS_DIR_PROPERTY)
  Optional<String> devSpecsDir;

  @ConfigProperty(name = ClientErrorLog.ENABLED_PROPERTY, defaultValue = "true")
  boolean clientLogEnabled;

  @ConfigProperty(name = StaticAssetCaching.ENABLED_PROPERTY, defaultValue = "true")
  boolean assetCachingEnabled;

  void register(@Observes Router router) {
    cors(router);
    if (assetCachingEnabled) {
      assetCaching(router);
    }
    clientLog(router);
    documents(router);
    if (mcpEnabled) {
      mcp(router);
    }
    if (devEnabled) {
      dev(router);
    }
    yamlMounts(router);
  }

  private void cors(Router router) {
    var policy = CorsPolicy.of(allowedOrigins.orElse(null), allowCredentials);
    if (!policy.enabled()) {
      return;
    }
    router
        .route()
        .order(EARLY)
        .handler(
            rc -> {
              var request = rc.request();
              String origin = request.getHeader("Origin");
              if (origin == null || !CorsPolicy.appliesTo(request.path())) {
                rc.next();
                return;
              }
              String requestMethod = request.getHeader("Access-Control-Request-Method");
              if (CorsPolicy.isPreflight(request.method().name(), origin, requestMethod)) {
                var headers =
                    policy.preflightHeaders(
                        origin, requestMethod, request.getHeader("Access-Control-Request-Headers"));
                if (headers == null) {
                  rc.response().setStatusCode(403).end();
                  return;
                }
                headers.forEach(rc.response()::putHeader);
                rc.response().setStatusCode(200).end();
                return;
              }
              policy.responseHeaders(origin).forEach(rc.response()::putHeader);
              rc.next();
            });
  }

  private void assetCaching(Router router) {
    router
        .route()
        .order(EARLY + 1)
        .handler(
            rc -> {
              String policy = StaticAssetCaching.cacheControlFor(rc.request().path());
              if (policy != null) {
                rc.addHeadersEndHandler(
                    v -> {
                      int status = rc.response().getStatusCode();
                      if (status == 200 || status == 304) {
                        rc.response().putHeader("Cache-Control", policy);
                      }
                    });
              }
              rc.next();
            });
  }

  private void clientLog(Router router) {
    router
        .routeWithRegex(
            HttpMethod.POST, ".*" + java.util.regex.Pattern.quote(ClientErrorLog.PATH_SUFFIX))
        .order(EARLY + 2)
        .handler(BodyHandler.create().setBodyLimit(ClientErrorLog.MAX_BODY_BYTES + 1))
        .blockingHandler(
            rc -> {
              if (!clientLogEnabled) {
                rc.response().setStatusCode(ClientErrorLog.NOT_FOUND).end();
                return;
              }
              var body = rc.body().buffer();
              var user = rc.user() != null ? rc.user().subject() : null;
              rc.response()
                  .setStatusCode(ClientErrorLog.handle(body == null ? null : body.getBytes(), user))
                  .end();
            });
  }

  // GET <baseUrl>/mateu/v3/documents/<token>: a document an action produced, served once
  // (DocumentDownloads). Early, before any auth: the single-use token is the authorization.
  private void documents(Router router) {
    router
        .routeWithRegex(
            HttpMethod.GET,
            ".*" + java.util.regex.Pattern.quote(DocumentDownloads.PATH_MARKER) + "[A-Za-z0-9_-]+")
        .order(EARLY + 2)
        .blockingHandler(
            rc -> {
              var served = DocumentDownloads.serve(rc.request().path());
              var response = rc.response().setStatusCode(served.status());
              served.headers().forEach(response::putHeader);
              response.end(io.vertx.core.buffer.Buffer.buffer(served.body()));
            });
  }

  private void mcp(Router router) {
    var endpoint = new McpEndpoint(service);
    router
        .post(McpEndpoint.PATH)
        .order(EARLY + 3)
        .handler(BodyHandler.create())
        .blockingHandler(
            rc -> {
              try {
                String response =
                    endpoint.handle(
                        rc.body().asString(),
                        rq -> new QuarkusHttpRequest(rc.request()).storeRunActionRqDto(rq));
                if (response == null) {
                  rc.response().setStatusCode(McpEndpoint.ACCEPTED).end();
                } else {
                  rc.response().putHeader("Content-Type", "application/json").end(response);
                }
              } catch (Exception e) {
                rc.fail(e);
              }
            });
  }

  /** Live reload ({@code mateu.dev=true} only): the dev event stream and the reload trigger. */
  private void dev(Router router) {
    io.mateu.core.infra.dev.DevEndpoint.enable(devSpecsDir.orElse(null));
    router
        .get(io.mateu.core.infra.dev.DevEndpoint.EVENTS_PATH)
        .order(EARLY + 3)
        .handler(
            rc -> {
              var response = rc.response();
              response
                  .setChunked(true)
                  .putHeader("Content-Type", "text/event-stream")
                  .putHeader("Cache-Control", "no-cache");
              var context = rc.vertx().getOrCreateContext();
              var subscription =
                  io.mateu.core.infra.dev.DevEndpoint.events()
                      .subscribe(
                          json ->
                              context.runOnContext(
                                  v -> {
                                    if (!response.closed()) {
                                      response.write(io.mateu.core.infra.dev.DevEndpoint.sse(json));
                                    }
                                  }));
              response.closeHandler(v -> subscription.dispose());
            });
    router
        .post(io.mateu.core.infra.dev.DevEndpoint.RELOAD_PATH)
        .order(EARLY + 3)
        .handler(
            rc ->
                rc.response()
                    .setStatusCode(
                        io.mateu.core.infra.dev.DevEndpoint.reload(rc.request().getParam("scope")))
                    .end());
  }

  private void yamlMounts(Router router) {
    if (!YamlMounts.present(Thread.currentThread().getContextClassLoader())
        || !beanManager.getBeans(MateuController.class, Any.Literal.INSTANCE).isEmpty()) {
      return;
    }
    List<YamlMounts.Mount> mounts = YamlMounts.mounts(routeRegistry, yamlAppLoader);
    for (var mount : mounts) {
      router.get(mount.spaPath()).order(EARLY + 4).blockingHandler(rc -> index(rc, mount));
      router
          .postWithRegex(java.util.regex.Pattern.quote(mount.apiPrefix() + "/v3/") + ".*")
          .order(EARLY + 5)
          .handler(BodyHandler.create())
          .blockingHandler(rc -> run(rc, mount));
      // Deep links answer the mount's index: AFTER Quarkus REST and the static resources, which
      // pass on what they do not serve, so the app's own endpoints and the assets keep winning.
      String deepLinks =
          mount.basePath().isEmpty()
              ? "/[^.]*"
              : java.util.regex.Pattern.quote(mount.spaPath() + "/") + "[^.]*";
      router
          .getWithRegex(deepLinks)
          .order(Integer.MAX_VALUE - 100)
          .blockingHandler(
              rc -> {
                if (rc.request().path().contains("/mateu/")) {
                  rc.next();
                } else {
                  index(rc, mount);
                }
              });
    }
  }

  private static void index(RoutingContext rc, YamlMounts.Mount mount) {
    rc.response().putHeader("Content-Type", "text/html;charset=UTF-8").end(mount.indexHtml());
  }

  private void run(RoutingContext rc, YamlMounts.Mount mount) {
    try {
      var rq = WireMapper.shared().readValue(rc.body().asString(), RunActionRqDto.class);
      var httpRequest = new QuarkusHttpRequest(rc.request()).storeRunActionRqDto(rq);
      httpRequest.setAttribute("uiId", "");
      httpRequest.setAttribute("baseUrl", mount.basePath());
      var increments = service.runAction(mount.basePath(), rq, mount.basePath(), httpRequest);
      var response = rc.response();
      if (rc.request().path().startsWith(mount.apiPrefix() + "/v3/sse/")) {
        response.setChunked(true).putHeader("Content-Type", "text/event-stream");
        increments
            .doOnNext(increment -> response.write(WireMapper.sseEvent(increment)))
            .doOnError(rc::fail)
            .doOnComplete(response::end)
            .subscribe();
      } else {
        var increment = increments.blockFirst();
        response
            .putHeader("Content-Type", "application/json")
            .end(WireMapper.shared().writeValueAsString(increment));
      }
    } catch (Throwable t) {
      rc.fail(t);
    }
  }
}
