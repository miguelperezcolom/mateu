package io.mateu.dev;

import io.mateu.core.infra.dev.DevEndpoint;
import java.io.IOException;
import java.time.Duration;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
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
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnProperty(name = DevEndpoint.ENABLED_PROPERTY, havingValue = "true")
public class MateuDevAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuDevRoutes(Environment environment) {
    DevEndpoint.enable(environment.getProperty(DevEndpoint.SPECS_DIR_PROPERTY));
    return RouterFunctions.route()
        .GET(DevEndpoint.EVENTS_PATH, request -> events())
        .POST(
            DevEndpoint.RELOAD_PATH,
            request ->
                ServerResponse.status(DevEndpoint.reload(request.param("scope").orElse(null)))
                    .build())
        .build();
  }

  private static ServerResponse events() {
    return ServerResponse.sse(
        sse -> {
          Disposable subscription =
              DevEndpoint.events()
                  .subscribe(
                      json -> {
                        try {
                          sse.data(json);
                        } catch (IOException e) {
                          // the browser went away: onError/onComplete dispose the subscription
                          sse.error(e);
                        }
                      });
          sse.onComplete(subscription::dispose);
          sse.onTimeout(subscription::dispose);
          sse.onError(t -> subscription.dispose());
        },
        // A long timeout: the browser's EventSource reconnects by itself when it does expire.
        Duration.ofHours(1));
  }
}
