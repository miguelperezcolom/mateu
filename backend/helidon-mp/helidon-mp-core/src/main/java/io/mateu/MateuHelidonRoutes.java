package io.mateu;

import io.helidon.http.HeaderNames;
import io.helidon.http.Method;
import io.helidon.http.Status;
import io.helidon.microprofile.server.ServerCdiExtension;
import io.helidon.webserver.http.HttpRouting;
import io.helidon.webserver.http.ServerRequest;
import io.helidon.webserver.http.ServerResponse;
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
import io.mateu.core.infra.dev.DevEndpoint;
import io.mateu.core.infra.documents.DocumentDownloads;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.Instance;
import jakarta.enterprise.inject.spi.Bean;
import jakarta.enterprise.inject.spi.BeanManager;
import jakarta.inject.Inject;
import jakarta.interceptor.Interceptor;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.eclipse.microprofile.config.Config;
import reactor.core.publisher.Flux;

/**
 * The adapter-level HTTP surface on Helidon MP, registered on the Helidon routing (ahead of Jersey,
 * behind nothing): the {@code mateu.cors.allowed-origins} allow-list ({@link CorsPolicy}), the
 * asset cache policy ({@link StaticAssetCaching}), the renderer's error reports ({@link
 * ClientErrorLog}), the MCP endpoint ({@link McpEndpoint}, only with {@code
 * mateu.mcp.enabled=true}) and, for a deployment with no Java {@code @UI}, the YAML mounts ({@link
 * YamlMounts}). The same contract as every other adapter, each piece decided in core.
 *
 * <p>Registered while the CDI container starts, before Helidon builds and starts the server.
 */
@ApplicationScoped
public class MateuHelidonRoutes {

  @Inject Instance<MateuService> service;
  @Inject Instance<RouteRegistry> routeRegistry;
  @Inject Instance<YamlAppLoader> yamlAppLoader;
  @Inject Config config;

  void register(
      @Observes
          @Priority(Interceptor.Priority.LIBRARY_BEFORE + 10)
          @Initialized(ApplicationScoped.class)
          Object event,
      BeanManager beanManager) {
    HttpRouting.Builder routing =
        beanManager.getExtension(ServerCdiExtension.class).serverRoutingBuilder();
    var policy =
        CorsPolicy.of(
            config.getOptionalValue(CorsPolicy.ALLOWED_ORIGINS_PROPERTY, String.class).orElse(null),
            config
                .getOptionalValue(CorsPolicy.ALLOW_CREDENTIALS_PROPERTY, String.class)
                .orElse("false"));
    boolean caching =
        config.getOptionalValue(StaticAssetCaching.ENABLED_PROPERTY, Boolean.class).orElse(true);
    boolean clientLog =
        config.getOptionalValue(ClientErrorLog.ENABLED_PROPERTY, Boolean.class).orElse(true);
    boolean mcp =
        config.getOptionalValue(McpEndpoint.ENABLED_PROPERTY, Boolean.class).orElse(false);

    routing.addFilter(
        (chain, req, res) -> {
          String path = req.path().path();
          if (CorsPolicy.appliesTo(path)) {
            // the version headers: the build id on every response (refusals and errors included),
            // set when the response is sent — the first request builds the wire type allow-list
            io.mateu.core.infra.versioning.RendererCompatibility.check(
                header(req, io.mateu.core.infra.versioning.RendererCompatibility.HEADER));
            res.beforeSend(
                () -> {
                  var build = io.mateu.core.infra.versioning.AppBuild.id();
                  if (build != null) {
                    res.header(io.mateu.core.infra.versioning.AppBuild.HEADER, build);
                  }
                });
          }
          if (policy.enabled() && CorsPolicy.appliesTo(path)) {
            String origin = header(req, "Origin");
            if (origin != null) {
              String requestMethod = header(req, "Access-Control-Request-Method");
              if (CorsPolicy.isPreflight(req.prologue().method().text(), origin, requestMethod)) {
                var headers =
                    policy.preflightHeaders(
                        origin, requestMethod, header(req, "Access-Control-Request-Headers"));
                if (headers == null) {
                  res.status(Status.FORBIDDEN_403).send();
                } else {
                  headers.forEach(res::header);
                  res.status(Status.OK_200).send();
                }
                return;
              }
              policy.responseHeaders(origin).forEach(res::header);
            }
          }
          // 415 to a non-JSON POST to the action endpoints (JsonBodyGuard): the CORS-simple
          // requests a cross-site page could forge with the user's cookies — Jersey bound them
          if (io.mateu.core.infra.security.JsonBodyGuard.refuses(
              req.prologue().method().text(), path, header(req, "Content-Type"))) {
            res.status(
                    Status.create(
                        io.mateu.core.infra.security.JsonBodyGuard.UNSUPPORTED_MEDIA_TYPE))
                .header("Content-Type", "text/plain;charset=UTF-8")
                .send(io.mateu.core.infra.security.JsonBodyGuard.MESSAGE);
            return;
          }
          if (caching) {
            String cacheControl = StaticAssetCaching.cacheControlFor(path);
            if (cacheControl != null) {
              res.beforeSend(
                  () -> {
                    int status = res.status().code();
                    if (status == 200 || status == 304) {
                      res.header("Cache-Control", cacheControl);
                    }
                  });
            }
          }
          chain.proceed();
        });

    routing.route(
        Method.POST,
        "/*",
        (req, res) -> {
          if (!ClientErrorLog.isEndpoint(req.path().path())) {
            res.next();
            return;
          }
          if (!clientLog) {
            res.status(ClientErrorLog.NOT_FOUND).send();
            return;
          }
          byte[] body;
          try (InputStream in = req.content().inputStream()) {
            body = in.readNBytes(ClientErrorLog.MAX_BODY_BYTES + 1);
          } catch (IOException e) {
            res.status(ClientErrorLog.BAD_REQUEST).send();
            return;
          }
          // rate-limited per client address (the endpoint is open to anonymous callers)
          res.status(ClientErrorLog.handle(body, null, req.remotePeer().host())).send();
        });

    // GET <baseUrl>/mateu/v3/documents/<token>: a document an action produced, served once
    // (DocumentDownloads), on the Helidon routing ahead of Jersey; the single-use token is the
    // authorization.
    routing.route(
        Method.GET,
        "/*",
        (req, res) -> {
          String path = req.path().path();
          if (!DocumentDownloads.isEndpoint(path)) {
            res.next();
            return;
          }
          var served = DocumentDownloads.serve(path);
          res.status(Status.create(served.status()));
          served.headers().forEach(res::header);
          res.send(served.body());
        });

    // Streamed actions of the generated controllers: answered here, on the Helidon routing, so each
    // event reaches the browser when it is produced. Through Jersey a StreamingOutput is buffered
    // until the action ends — the LongTask progress dialog only ever showed the final state.
    Map<String, String> uiIdsByBaseUrl = generatedUis(beanManager);
    if (!uiIdsByBaseUrl.isEmpty()) {
      routing.route(
          Method.POST,
          "/*",
          (req, res) -> {
            String path = req.path().path();
            int sse = path.indexOf("/mateu/v3/sse/");
            String baseUrl = sse >= 0 ? path.substring(0, sse) : null;
            if (baseUrl == null || !uiIdsByBaseUrl.containsKey(baseUrl)) {
              res.next();
              return;
            }
            stream(req, res, uiIdsByBaseUrl.get(baseUrl), baseUrl);
          });
    }

    if (mcp) {
      routing.post(
          McpEndpoint.PATH,
          (req, res) -> {
            var endpoint = new McpEndpoint(service.get());
            String response =
                endpoint.handle(
                    req.content().as(String.class),
                    rq -> new HelidonSeHttpRequest(req).storeRunActionRqDto(rq));
            if (response == null) {
              res.status(McpEndpoint.ACCEPTED).send();
            } else {
              res.header("Content-Type", "application/json").send(response);
            }
          });
    }

    if (config.getOptionalValue(DevEndpoint.ENABLED_PROPERTY, Boolean.class).orElse(false)) {
      dev(
          routing,
          config.getOptionalValue(DevEndpoint.SPECS_DIR_PROPERTY, String.class).orElse(null));
    }

    if (YamlMounts.present(Thread.currentThread().getContextClassLoader())) {
      // served next to the @UI classes: a base path a class already serves is left to it
      yamlMountRoutes(
          routing,
          YamlMounts.notServedByClasses(
              YamlMounts.mounts(routeRegistry.get(), yamlAppLoader.get()),
              generatedUis(beanManager).keySet()),
          service::get,
          routeRegistry::get,
          yamlAppLoader::get);
    }
  }

  /**
   * The routes of the given YAML mounts: the SPA shell, the mobile manifest, the deep links and the
   * sync/SSE API. Split from the presence check so it can be exercised on a plain Helidon routing.
   */
  static void yamlMountRoutes(
      HttpRouting.Builder routing,
      List<YamlMounts.Mount> mounts,
      Supplier<MateuService> service,
      Supplier<RouteRegistry> routeRegistry,
      Supplier<YamlAppLoader> yamlAppLoader) {
    for (var mount : mounts) {
      routing.get(mount.spaPath(), (req, res) -> index(res, mount));
      routing.get(
          mount.apiPrefix() + "/v3/manifest",
          (req, res) -> {
            io.mateu.core.infra.MobileManifest.HEADERS.forEach(res::header);
            res.send(
                YamlMounts.manifestJson(
                    routeRegistry.get(), yamlAppLoader.get(), mount.basePath()));
          });
      routing.get(
          mount.apiPrefix() + "/v3/pwa/{file}",
          (req, res) -> {
            var asset =
                YamlMounts.pwaAsset(
                    routeRegistry.get(),
                    yamlAppLoader.get(),
                    mount.basePath(),
                    req.path().pathParameters().get("file"));
            if (asset == null) {
              res.status(Status.NOT_FOUND_404).send();
              return;
            }
            asset.headers().forEach(res::header);
            res.send(asset.body());
          });
      if (mount.basePath().isEmpty()) {
        // A deep link into the ROOT mount (/products on a reload or a shared link) had no handler:
        // only "/" was routed, so it answered Jersey's "Endpoint not found". Claim only the paths
        // the mount's registry authors (a route or a sub-route of one), so the app's own JAX-RS
        // resources are never shadowed.
        routing.get(
            "/*",
            (req, res) -> {
              var path = req.path().path();
              if (io.mateu.core.infra.SpaFallback.candidate(path)
                  && io.mateu.core.infra.SpaFallback.acceptsHtml(
                      req.headers().first(io.helidon.http.HeaderNames.ACCEPT).orElse(null))
                  && !path.startsWith("/mateu")
                  && authoredHere(routeRegistry.get(), path)) {
                index(res, mount);
              } else {
                res.next();
              }
            });
      } else {
        routing.get(
            mount.spaPath() + "/*",
            (req, res) -> {
              var path = req.path().path();
              if (io.mateu.core.infra.SpaFallback.isAsset(path)
                  || path.contains("/mateu/")
                  || !io.mateu.core.infra.SpaFallback.acceptsHtml(
                      req.headers().first(io.helidon.http.HeaderNames.ACCEPT).orElse(null))) {
                res.next();
              } else {
                index(res, mount);
              }
            });
      }
      routing.post(mount.apiPrefix() + "/v3/*", (req, res) -> run(req, res, mount, service.get()));
    }
  }

  /** Live reload ({@code mateu.dev=true} only): the dev event stream and the reload trigger. */
  private static void dev(HttpRouting.Builder routing, String specsDir) {
    DevEndpoint.enable(specsDir);
    routing.get(
        DevEndpoint.EVENTS_PATH,
        (req, res) -> {
          res.header("Content-Type", "text/event-stream");
          res.header("Cache-Control", "no-cache");
          try (OutputStream out = res.outputStream();
              var events = DevEndpoint.events().toStream()) {
            var it = events.iterator();
            while (it.hasNext()) {
              out.write(DevEndpoint.sse(it.next()).getBytes(StandardCharsets.UTF_8));
              out.flush();
            }
          } catch (IOException | java.io.UncheckedIOException e) {
            // the browser went away; closing the stream cancelled the subscription
          }
        });
    routing.post(
        DevEndpoint.RELOAD_PATH,
        (req, res) -> {
          var scope = req.query().contains("scope") ? req.query().get("scope") : null;
          res.status(Status.create(DevEndpoint.reload(scope))).send();
        });
  }

  /**
   * baseUrl → uiId of every generated controller (their MATEU_BASE_URL / MATEU_UI_ID constants).
   */
  private static Map<String, String> generatedUis(BeanManager beanManager) {
    Map<String, String> uis = new HashMap<>();
    for (Bean<?> bean : beanManager.getBeans(MateuController.class, Any.Literal.INSTANCE)) {
      try {
        Class<?> type = bean.getBeanClass();
        uis.put(
            (String) type.getField("MATEU_BASE_URL").get(null),
            (String) type.getField("MATEU_UI_ID").get(null));
      } catch (ReflectiveOperationException | ClassCastException e) {
        // a controller generated by an older annotation processor: Jersey answers its SSE calls
      }
    }
    return uis;
  }

  private void stream(ServerRequest req, ServerResponse res, String uiId, String baseUrl)
      throws Exception {
    var rq = WireMapper.shared().readValue(req.content().as(String.class), RunActionRqDto.class);
    var httpRequest = new HelidonSeHttpRequest(req).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", uiId);
    httpRequest.setAttribute("baseUrl", baseUrl);
    try {
      var increments = service.get().runAction(uiId, rq, baseUrl, httpRequest);
      writeEvents(res, increments);
    } catch (Exception e) {
      if (!refused(res, e)) {
        throw e;
      }
    } catch (Throwable t) {
      throw new IllegalStateException(t);
    }
  }

  /**
   * Answers a refusal ({@code access:}, a refused action) as the JAX-RS {@code
   * MateuForbiddenExceptionMapper} does — 403 with the public message. These routes run on
   * Helidon's own routing, which that mapper does not cover: a refusal surfaced as a 500.
   */
  private static boolean refused(ServerResponse res, Throwable t) {
    for (var cause = t; cause != null; cause = cause.getCause()) {
      if (cause instanceof io.mateu.core.application.security.MateuForbiddenException) {
        if (!res.isSent()) {
          res.status(Status.FORBIDDEN_403)
              .header("Content-Type", "text/plain")
              .send(io.mateu.core.application.security.MateuForbiddenException.publicMessage());
        }
        return true;
      }
    }
    return false;
  }

  /** Writes each increment as one {@code data:} event, flushed as soon as it is produced. */
  private static void writeEvents(ServerResponse res, Flux<UIIncrementDto> increments)
      throws IOException {
    // the first event BEFORE anything is committed: the request is guarded lazily, and once the
    // output stream is open a refusal can no longer be answered as a 403
    var events = increments.toIterable().iterator();
    events.hasNext();
    res.header("Content-Type", "text/event-stream");
    res.header("Cache-Control", "no-cache");
    try (OutputStream out = res.outputStream()) {
      while (events.hasNext()) {
        out.write(WireMapper.sseEvent(events.next()).getBytes(StandardCharsets.UTF_8));
        out.flush();
      }
    }
  }

  private static String header(ServerRequest req, String name) {
    return req.headers().first(HeaderNames.create(name)).orElse(null);
  }

  /** Whether the registry authors {@code path} or a prefix of it (a crud's /new, /:id/edit). */
  static boolean authoredHere(RouteRegistry registry, String path) {
    var candidate = path;
    while (!candidate.isEmpty() && !"/".equals(candidate)) {
      if (registry.match(candidate).isPresent()) {
        return true;
      }
      var slash = candidate.lastIndexOf('/');
      candidate = slash <= 0 ? "" : candidate.substring(0, slash);
    }
    return false;
  }

  private static void index(ServerResponse res, YamlMounts.Mount mount) {
    res.header("Content-Type", "text/html;charset=UTF-8").send(mount.indexHtml());
  }

  private static void run(
      ServerRequest req, ServerResponse res, YamlMounts.Mount mount, MateuService service)
      throws Exception {
    var rq = WireMapper.shared().readValue(req.content().as(String.class), RunActionRqDto.class);
    var httpRequest = new HelidonSeHttpRequest(req).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", mount.basePath());
    try {
      var increments =
          service.runAction(
              mount.basePath(),
              YamlMounts.mountRequest(mount.basePath(), rq),
              mount.basePath(),
              httpRequest);
      if (req.path().path().startsWith(mount.apiPrefix() + "/v3/sse/")) {
        writeEvents(res, increments);
      } else {
        res.header("Content-Type", "application/json")
            .send(WireMapper.shared().writeValueAsString(increments.blockFirst()));
      }
    } catch (Exception e) {
      if (!refused(res, e)) {
        throw e;
      }
    } catch (Throwable t) {
      throw new IllegalStateException(t);
    }
  }
}
