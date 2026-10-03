package io.mateu;

import io.mateu.core.application.security.MateuForbiddenException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Answers a request Mateu refuses (a server-side type the app does not expose, a member that is not
 * an action, an access annotation the caller's token does not satisfy) with HTTP 403. The reason is
 * logged server-side; the body stays generic.
 */
@RestControllerAdvice
public class MateuForbiddenExceptionHandler {

  @ExceptionHandler(MateuForbiddenException.class)
  public ResponseEntity<String> forbidden(MateuForbiddenException e) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .contentType(MediaType.TEXT_PLAIN)
        .body(MateuForbiddenException.publicMessage());
  }
}
