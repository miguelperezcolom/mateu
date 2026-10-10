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
import io.mateu.dtos.RunActionRqDto;
import jakarta.annotation.Priority;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.Instance;
import jakarta.enterprise.inject.spi.BeanManager;
import jakarta.inject.Inject;
import jakarta.interceptor.Interceptor;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.eclipse.microprofile.config.Config;

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
          res.status(ClientErrorLog.handle(body, null)).send();
        });

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

    if (YamlMounts.present(Thread.currentThread().getContextClassLoader())
        && beanManager.getBeans(MateuController.class, Any.Literal.INSTANCE).isEmpty()) {
      List<YamlMounts.Mount> mounts = YamlMounts.mounts(routeRegistry.get(), yamlAppLoader.get());
      for (var mount : mounts) {
        routing.get(mount.spaPath(), (req, res) -> index(res, mount));
        if (!mount.basePath().isEmpty()) {
          routing.get(
              mount.spaPath() + "/*",
              (req, res) -> {
                var path = req.path().path();
                if (path.contains(".") || path.contains("/mateu/")) {
                  res.next();
                } else {
                  index(res, mount);
                }
              });
        }
        routing.post(mount.apiPrefix() + "/v3/*", (req, res) -> run(req, res, mount));
      }
    }
  }

  private static String header(ServerRequest req, String name) {
    return req.headers().first(HeaderNames.create(name)).orElse(null);
  }

  private static void index(ServerResponse res, YamlMounts.Mount mount) {
    res.header("Content-Type", "text/html;charset=UTF-8").send(mount.indexHtml());
  }

  private void run(ServerRequest req, ServerResponse res, YamlMounts.Mount mount) throws Exception {
    var rq = WireMapper.shared().readValue(req.content().as(String.class), RunActionRqDto.class);
    var httpRequest = new HelidonSeHttpRequest(req).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", mount.basePath());
    try {
      var increments = service.get().runAction(mount.basePath(), rq, mount.basePath(), httpRequest);
      if (req.path().path().startsWith(mount.apiPrefix() + "/v3/sse/")) {
        res.header("Content-Type", "text/event-stream");
        try (var out = res.outputStream()) {
          for (var increment : increments.toIterable()) {
            out.write(WireMapper.sseEvent(increment).getBytes(StandardCharsets.UTF_8));
            out.flush();
          }
        }
      } else {
        res.header("Content-Type", "application/json")
            .send(WireMapper.shared().writeValueAsString(increments.blockFirst()));
      }
    } catch (Exception e) {
      throw e;
    } catch (Throwable t) {
      throw new IllegalStateException(t);
    }
  }
}
