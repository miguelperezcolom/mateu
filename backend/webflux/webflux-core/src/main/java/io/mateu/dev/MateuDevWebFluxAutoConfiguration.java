package io.mateu.dev;

import io.mateu.core.infra.dev.DevEndpoint;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

/**
 * Live reload on WebFlux — {@code GET /mateu/dev/events} (SSE) and {@code POST /mateu/dev/reload},
 * the framework-neutral {@link DevEndpoint}. Only with {@code mateu.dev=true}.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
@ConditionalOnProperty(name = DevEndpoint.ENABLED_PROPERTY, havingValue = "true")
public class MateuDevWebFluxAutoConfiguration {

  @Bean
  public RouterFunction<ServerResponse> mateuDevRoutes(Environment environment) {
    DevEndpoint.enable(environment.getProperty(DevEndpoint.SPECS_DIR_PROPERTY));
    return RouterFunctions.route()
        .GET(
            DevEndpoint.EVENTS_PATH,
            request ->
                ServerResponse.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(
                        BodyInserters.fromServerSentEvents(
                            DevEndpoint.events()
                                .map(json -> ServerSentEvent.builder(json).build()))))
        .POST(
            DevEndpoint.RELOAD_PATH,
            request ->
                ServerResponse.status(DevEndpoint.reload(request.queryParam("scope").orElse(null)))
                    .build())
        .build();
  }
}
