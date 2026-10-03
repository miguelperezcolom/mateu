package io.mateu;

import io.mateu.core.application.security.MateuForbiddenException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

/**
 * Answers a request Mateu refuses (a server-side type the app does not expose, a member that is not
 * an action, an access annotation the caller's token does not satisfy) with HTTP 403. The reason is
 * logged server-side; the body stays generic.
 */
@Provider
@ApplicationScoped
public class MateuForbiddenExceptionMapper implements ExceptionMapper<MateuForbiddenException> {

  @Override
  public Response toResponse(MateuForbiddenException exception) {
    return Response.status(Response.Status.FORBIDDEN)
        .type(MediaType.TEXT_PLAIN_TYPE)
        .entity(MateuForbiddenException.publicMessage())
        .build();
  }
}
