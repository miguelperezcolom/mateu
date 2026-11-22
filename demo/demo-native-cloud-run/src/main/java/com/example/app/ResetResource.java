package com.example.app;

import jakarta.inject.Inject;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.Response;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

/**
 * Puts the public demo back to its four sample products. Called once a day by Cloud Scheduler
 * with the {@code X-Reset-Token} header; without a configured token (DEMO_RESET_TOKEN) the endpoint
 * refuses everything.
 */
@Path("/internal/reset")
public class ResetResource {

  @Inject ProductStore store;

  @ConfigProperty(name = "demo.reset-token")
  Optional<String> token;

  @POST
  public Response reset(@HeaderParam("X-Reset-Token") String given) {
    if (token.isEmpty() || token.get().isBlank() || given == null
        || !MessageDigest.isEqual(
            token.get().getBytes(StandardCharsets.UTF_8), given.getBytes(StandardCharsets.UTF_8))) {
      return Response.status(Response.Status.FORBIDDEN).build();
    }
    store.reset();
    return Response.noContent().build();
  }
}
