package io.mateu;

import io.mateu.core.infra.uploads.UploadEndpoint;
import io.smallrye.common.annotation.Blocking;
import io.vertx.core.http.HttpServerRequest;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.InputStream;

/**
 * {@code POST /mateu/v3/upload} and {@code /mateu/v3/upload/target} on Quarkus: the HTTP shell of
 * {@link UploadEndpoint}, {@code @Blocking} because the body is read as a blocking stream. Quarkus
 * refuses bodies over {@code quarkus.http.limits.max-body-size} (10 MB by default) before Mateu
 * sees them: raise it to the largest file the app accepts.
 */
@ApplicationScoped
@Path("/mateu/v3/upload")
public class MateuUploadController {

  private final UploadEndpoint endpoint = new UploadEndpoint();

  @POST
  @Blocking
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public Response upload(
      @HeaderParam(UploadEndpoint.TICKET_HEADER) String ticket,
      @HeaderParam(UploadEndpoint.NAME_HEADER) String name,
      @HeaderParam(HttpHeaders.CONTENT_TYPE) String contentType,
      @HeaderParam(HttpHeaders.CONTENT_LENGTH) String contentLength,
      InputStream body,
      HttpServerRequest serverHttpRequest) {
    return json(
        endpoint.upload(
            ticket,
            name,
            contentType,
            length(contentLength),
            body,
            new QuarkusHttpRequest(serverHttpRequest)));
  }

  @POST
  @Path("target")
  @Blocking
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public Response target(
      @HeaderParam(UploadEndpoint.TICKET_HEADER) String ticket,
      String body,
      HttpServerRequest serverHttpRequest) {
    return json(endpoint.target(ticket, body, new QuarkusHttpRequest(serverHttpRequest)));
  }

  static long length(String header) {
    if (header == null || header.isBlank()) {
      return -1;
    }
    try {
      return Long.parseLong(header.trim());
    } catch (NumberFormatException notANumber) {
      return -1;
    }
  }

  private static Response json(UploadEndpoint.Answer answer) {
    return Response.status(answer.status())
        .type(MediaType.APPLICATION_JSON)
        .entity(answer.body())
        .build();
  }
}
