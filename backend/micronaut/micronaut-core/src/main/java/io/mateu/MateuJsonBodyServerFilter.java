package io.mateu;

import io.mateu.core.infra.security.JsonBodyGuard;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.core.order.Ordered;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.http.filter.ServerFilterPhase;

/**
 * Answers 415 to a POST to Mateu's action endpoints whose body is not declared JSON ({@link
 * JsonBodyGuard}): the CORS-simple requests a cross-site page could forge with the user's cookies.
 * Micronaut's own {@code consumes} check let a request with no Content-Type through, and the MCP
 * controller consumes anything. Right after the CORS filter, before security.
 */
@ServerFilter(ServerFilter.MATCH_ALL_PATTERN)
public class MateuJsonBodyServerFilter implements Ordered {

  @Override
  public int getOrder() {
    return ServerFilterPhase.FIRST.before() + 1;
  }

  @RequestFilter
  @Nullable
  public HttpResponse<?> refuseNonJson(HttpRequest<?> request) {
    if (!JsonBodyGuard.refuses(
        request.getMethodName(), request.getPath(), request.getHeaders().get("Content-Type"))) {
      return null;
    }
    return HttpResponse.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
        .contentType(MediaType.TEXT_PLAIN_TYPE)
        .body(JsonBodyGuard.MESSAGE);
  }
}
