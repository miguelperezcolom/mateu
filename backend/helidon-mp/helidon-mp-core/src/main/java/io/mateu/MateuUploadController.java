package io.mateu;

import io.mateu.core.infra.uploads.UploadEndpoint;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;
import java.io.InputStream;

/**
 * {@code POST /mateu/v3/upload} and {@code /mateu/v3/upload/target} on Helidon MP: the HTTP shell
 * of {@link UploadEndpoint}. {@code @ApplicationScoped} so Jersey/Weld discover it from the
 * adapter's bean archive. Jersey hands the body over as a stream (Helidon's {@code
 * server.max-payload-size}, when the app sets one, still applies first).
 */
@ApplicationScoped
@Path("/mateu/v3/upload")
public class MateuUploadController {

  private final UploadEndpoint endpoint = new UploadEndpoint();

  @POST
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public Response upload(
      @HeaderParam(UploadEndpoint.TICKET_HEADER) String ticket,
      @HeaderParam(UploadEndpoint.NAME_HEADER) String name,
      @HeaderParam(HttpHeaders.CONTENT_TYPE) String contentType,
      @HeaderParam(HttpHeaders.CONTENT_LENGTH) String contentLength,
      InputStream body,
      @Context HttpHeaders headers,
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext) {
    return json(
        endpoint.upload(
            ticket,
            name,
            contentType,
            length(contentLength),
            body,
            request(headers, uriInfo, securityContext)));
  }

  @POST
  @Path("target")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public Response target(
      @HeaderParam(UploadEndpoint.TICKET_HEADER) String ticket,
      String body,
      @Context HttpHeaders headers,
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext) {
    return json(endpoint.target(ticket, body, request(headers, uriInfo, securityContext)));
  }

  private static HelidonMPHttpRequest request(
      HttpHeaders headers, UriInfo uriInfo, SecurityContext securityContext) {
    return new HelidonMPHttpRequest(headers, uriInfo)
        .withPrincipal(securityContext != null ? securityContext.getUserPrincipal() : null);
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
