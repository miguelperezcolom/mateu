package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.infra.BundleEndpoint;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.annotation.QueryValue;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import jakarta.inject.Inject;

/**
 * {@code GET /mateu/v3/bundle} on Micronaut: the HTTP shell of {@link BundleEndpoint}, on the
 * blocking pool because the exporter {@code blockFirst()}s each route (it must stay off the Netty
 * event loop). Cross-origin access relies on the app's {@code micronaut.server.cors} config
 * ({@code @CrossOrigin} is not processable in this module, and a manual header would double up when
 * global CORS is enabled).
 */
@Controller("/mateu/v3")
public class MateuBundleController {

  private final BundleEndpoint endpoint;

  @Inject
  public MateuBundleController(MateuService service) {
    // the app classloader (sees the META-INF/mateu route index); the TCCL is unreliable off the
    // request thread
    this.endpoint = new BundleEndpoint(service, getClass().getClassLoader());
  }

  @Get("/bundle")
  @Produces(MediaType.APPLICATION_JSON)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> bundle(
      @QueryValue(value = BundleEndpoint.PARAMS_QUERY, defaultValue = "false")
          boolean includeParamRoutes) {
    var answer = endpoint.render(includeParamRoutes);
    return HttpResponse.<String>status(HttpStatus.valueOf(answer.status()))
        .body(answer.body())
        .contentType(MediaType.APPLICATION_JSON);
  }
}
