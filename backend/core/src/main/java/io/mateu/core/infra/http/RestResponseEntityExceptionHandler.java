package io.mateu.core.infra.http;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.result.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestControllerAdvice
@Slf4j
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(value = {Exception.class})
  public Mono<ResponseEntity<Object>> handleAll(Exception ex, ServerWebExchange request) {
    String bodyOfResponse = "";
    if (!Exception.class.equals(ex.getClass())) {
      bodyOfResponse += ex.getClass().getSimpleName() + ": ";
    }
    bodyOfResponse += ex.getMessage();
    log.error("Something unexpected happened", ex);
    return handleExceptionInternal(
        ex, bodyOfResponse, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
  }
}
