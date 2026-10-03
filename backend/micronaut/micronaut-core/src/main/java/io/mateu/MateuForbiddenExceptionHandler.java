package io.mateu;

import io.mateu.core.application.security.MateuForbiddenException;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

/**
 * Answers a request Mateu refuses (a server-side type the app does not expose, a member that is not
 * an action, an access annotation the caller's token does not satisfy) with HTTP 403. The reason is
 * logged server-side; the body stays generic.
 */
@Produces
@Singleton
@Requires(classes = {MateuForbiddenException.class, ExceptionHandler.class})
public class MateuForbiddenExceptionHandler
    implements ExceptionHandler<MateuForbiddenException, HttpResponse<String>> {

  @Override
  public HttpResponse<String> handle(HttpRequest request, MateuForbiddenException exception) {
    return HttpResponse.<String>status(HttpStatus.FORBIDDEN)
        .contentType(MediaType.TEXT_PLAIN_TYPE)
        .body(MateuForbiddenException.publicMessage());
  }
}
