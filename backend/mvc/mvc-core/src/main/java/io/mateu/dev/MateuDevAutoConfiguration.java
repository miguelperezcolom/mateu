package io.mateu.dev;

import io.mateu.core.infra.dev.DevEndpoint;
import jakarta.servlet.AsyncEvent;
import jakarta.servlet.AsyncListener;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;
import reactor.core.Disposable;

/**
 * Live reload on Spring MVC: development mode ({@code mateu.dev=true}, or {@code MATEU_DEV=true})
 * switches the specs to the source directory, watches it, and serves {@code GET /mateu/dev/events}
 * (SSE) and {@code POST /mateu/dev/reload} — the framework-neutral {@link DevEndpoint}. Absent
 * otherwise: no property, no endpoints.
 *
 * <p>The event stream is a plain async servlet that writes and flushes each frame itself: an
 * endless stream must not depend on anything between it and the socket deciding when to flush.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnProperty(name = DevEndpoint.ENABLED_PROPERTY, havingValue = "true")
public class MateuDevAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuDevRoutes(Environment environment) {
    DevEndpoint.enable(environment.getProperty(DevEndpoint.SPECS_DIR_PROPERTY));
    return RouterFunctions.route()
        .POST(
            DevEndpoint.RELOAD_PATH,
            request ->
                ServerResponse.status(DevEndpoint.reload(request.param("scope").orElse(null)))
                    .build())
        .build();
  }

  @Bean
  public ServletRegistrationBean<HttpServlet> mateuDevEventsServlet() {
    var registration = new ServletRegistrationBean<HttpServlet>(new DevEventsServlet());
    registration.addUrlMappings(DevEndpoint.EVENTS_PATH);
    registration.setAsyncSupported(true);
    registration.setName("mateuDevEvents");
    return registration;
  }

  /** {@code GET /mateu/dev/events}: one {@code data:} frame per event, flushed as it happens. */
  static final class DevEventsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
      response.setStatus(200);
      response.setContentType("text/event-stream");
      response.setCharacterEncoding("UTF-8");
      response.setHeader("Cache-Control", "no-cache");
      response.flushBuffer();
      var async = request.startAsync();
      async.setTimeout(0);
      var out = response.getOutputStream();
      var subscription = new AtomicReference<Disposable>();
      Runnable close =
          () -> {
            var current = subscription.getAndSet(null);
            if (current != null) {
              current.dispose();
            }
          };
      subscription.set(
          DevEndpoint.events()
              .subscribe(
                  json -> {
                    try {
                      synchronized (out) {
                        out.write(DevEndpoint.sse(json).getBytes(StandardCharsets.UTF_8));
                        out.flush();
                      }
                    } catch (IOException | IllegalStateException e) {
                      // the browser went away
                      close.run();
                      try {
                        async.complete();
                      } catch (IllegalStateException ignored) {
                        // already completed
                      }
                    }
                  }));
      async.addListener(
          new AsyncListener() {
            @Override
            public void onComplete(AsyncEvent event) {
              close.run();
            }

            @Override
            public void onTimeout(AsyncEvent event) {
              close.run();
            }

            @Override
            public void onError(AsyncEvent event) {
              close.run();
            }

            @Override
            public void onStartAsync(AsyncEvent event) {}
          });
    }
  }
}
