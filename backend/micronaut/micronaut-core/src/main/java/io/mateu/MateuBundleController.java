package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.export.MateuBundleExporter;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.annotation.QueryValue;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import jakarta.inject.Inject;

/**
 * Serves the static bundle at RUNTIME (no build step): {@code GET /mateu/v3/bundle} returns the
 * same {@code manifest.json} the {@code mateu:bundle} Maven goal produces, rendered live from this
 * app's bean graph. Cached after first compute; runs on the blocking pool because the exporter
 * {@code blockFirst()}s each route (must stay off the Netty event loop). Cross-origin access relies
 * on the app's {@code micronaut.server.cors} config ({@code @CrossOrigin} is not processable in
 * this module, and a manual header would double up when global CORS is enabled). Micronaut
 * counterpart of the MVC controller.
 */
@Controller("/mateu/v3")
public class MateuBundleController {

  private final MateuService service;
  private volatile String cached;
  private volatile String cachedWithParams;

  @Inject
  public MateuBundleController(MateuService service) {
    this.service = service;
  }

  @Get("/bundle")
  @Produces(MediaType.APPLICATION_JSON)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> bundle(
      @QueryValue(value = "params", defaultValue = "false") boolean includeParamRoutes) {
    var out = includeParamRoutes ? cachedWithParams : cached;
    if (out == null) {
      var cl =
          getClass().getClassLoader(); // app classloader (sees META-INF/mateu route index); TCCL is
      // unreliable off the request thread
      var manifest = new MateuBundleExporter(service).exportAll("", cl, true, includeParamRoutes);
      try {
        out = MateuBundleExporter.defaultWireMapper().writeValueAsString(manifest);
      } catch (Exception e) {
        return HttpResponse.serverError("{\"error\":\"" + e.getMessage() + "\"}");
      }
      if (includeParamRoutes) {
        cachedWithParams = out;
      } else {
        cached = out;
      }
    }
    return HttpResponse.ok(out).contentType(MediaType.APPLICATION_JSON);
  }
}
