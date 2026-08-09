package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.export.MateuBundleExporter;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Serves the static bundle at RUNTIME (no build step): {@code GET /mateu/v3/bundle} returns the
 * same {@code manifest.json} the {@code mateu:bundle} Maven goal produces, rendered live from this
 * app's bean graph. Cached after first compute. {@code @ApplicationScoped} so Jersey/Weld discover
 * it from the adapter's bean archive (like the generated RouteResolver) and the cache survives
 * across requests. Cross-origin access relies on the app's global CORS config (like the generated
 * sync endpoint, which carries no per-endpoint CORS annotation on the JAX-RS adapters). Helidon MP
 * counterpart of the MVC controller.
 */
@ApplicationScoped
@Path("/mateu/v3/bundle")
public class MateuBundleController {

  private final MateuService service;
  private volatile String cached;

  @Inject
  public MateuBundleController(MateuService service) {
    this.service = service;
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response bundle() {
    var out = cached;
    if (out == null) {
      var cl =
          getClass().getClassLoader(); // app classloader (sees META-INF/mateu route index); TCCL is
      // unreliable off the request thread
      var manifest = new MateuBundleExporter(service).exportAll("", cl, true);
      try {
        out = MateuBundleExporter.defaultWireMapper().writeValueAsString(manifest);
      } catch (Exception e) {
        return Response.serverError().entity("{\"error\":\"" + e.getMessage() + "\"}").build();
      }
      cached = out;
    }
    return Response.ok(out, MediaType.APPLICATION_JSON).build();
  }
}
