package io.mateu;

import io.mateu.core.infra.documents.DocumentDownloads;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.core.order.Ordered;
import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.http.filter.ServerFilterPhase;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;

/**
 * {@code GET <baseUrl>/mateu/v3/documents/<token>} on Micronaut: a document an action produced,
 * served once by {@link DocumentDownloads}. A filter because the endpoint lives under every UI's
 * base URL; it runs before security because the single-use token IS the authorization (a new tab or
 * a download link cannot carry the bearer token the API calls carry).
 */
@ServerFilter(ServerFilter.MATCH_ALL_PATTERN)
public class MateuDocumentServerFilter implements Ordered {

  @Override
  public int getOrder() {
    return ServerFilterPhase.FIRST.before() + 1;
  }

  @RequestFilter
  @ExecuteOn(TaskExecutors.BLOCKING)
  @Nullable
  public HttpResponse<?> serve(HttpRequest<?> request) {
    if (request.getMethod() != HttpMethod.GET || !DocumentDownloads.isEndpoint(request.getPath())) {
      return null;
    }
    var served = DocumentDownloads.serve(request.getPath());
    MutableHttpResponse<byte[]> response =
        HttpResponse.status(io.micronaut.http.HttpStatus.valueOf(served.status()));
    // Content-Length is Micronaut's to write (from the body), or it would be sent twice
    served.headers().entrySet().stream()
        .filter(h -> !"Content-Length".equals(h.getKey()))
        .forEach(h -> response.header(h.getKey(), h.getValue()));
    if (served.body().length > 0) {
      response.body(served.body());
    }
    return response;
  }
}
