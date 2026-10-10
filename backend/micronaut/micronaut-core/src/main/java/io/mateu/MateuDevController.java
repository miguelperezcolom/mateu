package io.mateu;

import io.mateu.core.infra.dev.DevEndpoint;
import io.micronaut.context.annotation.Context;
import io.micronaut.context.annotation.Requires;
import io.micronaut.context.annotation.Value;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.QueryValue;
import io.micronaut.http.sse.Event;
import org.reactivestreams.Publisher;

/**
 * Live reload on Micronaut — {@code GET /mateu/dev/events} (SSE) and {@code POST
 * /mateu/dev/reload}, the framework-neutral {@link DevEndpoint}. Only with {@code mateu.dev=true}.
 * {@link Context}-scoped (eager): dev mode has to be on before the first page is served, not when
 * somebody first opens the stream.
 */
@Context
@Controller
@Requires(property = DevEndpoint.ENABLED_PROPERTY, value = "true")
public class MateuDevController {

  public MateuDevController(@Nullable @Value("${mateu.dev.specs-dir:}") String specsDir) {
    DevEndpoint.enable(specsDir);
  }

  @Get(value = DevEndpoint.EVENTS_PATH, produces = MediaType.TEXT_EVENT_STREAM)
  public Publisher<Event<String>> events() {
    return DevEndpoint.events().map(Event::of);
  }

  @Post(value = DevEndpoint.RELOAD_PATH, consumes = MediaType.ALL)
  public HttpResponse<Void> reload(@Nullable @QueryValue String scope) {
    return HttpResponse.status(io.micronaut.http.HttpStatus.valueOf(DevEndpoint.reload(scope)));
  }
}
