package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.infra.BundleEndpoint;
import io.smallrye.common.annotation.Blocking;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * {@code GET /mateu/v3/bundle} on Quarkus: the HTTP shell of {@link BundleEndpoint},
 * {@code @Blocking} because the exporter {@code blockFirst()}s each route. Cross-origin access
 * relies on the app's global CORS config (like the generated sync endpoint, which carries no
 * per-endpoint CORS annotation on the JAX-RS adapters).
 */
@ApplicationScoped
@Path("/mateu/v3/bundle")
public class MateuBundleController {

  private final BundleEndpoint endpoint;

  @Inject
  public MateuBundleController(MateuService service) {
    // the app classloader (sees the META-INF/mateu route index); the TCCL is unreliable off the
    // request thread
    this.endpoint = new BundleEndpoint(service, getClass().getClassLoader());
  }

  @GET
  @Blocking
  @Produces(MediaType.APPLICATION_JSON)
  public Response bundle(
      @QueryParam(BundleEndpoint.PARAMS_QUERY) @DefaultValue("false") boolean includeParamRoutes) {
    var answer = endpoint.render(includeParamRoutes);
    return Response.status(answer.status())
        .type(MediaType.APPLICATION_JSON)
        .entity(answer.body())
        .build();
  }
}
