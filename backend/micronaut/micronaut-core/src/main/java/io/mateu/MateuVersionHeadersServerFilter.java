package io.mateu;

import io.mateu.core.infra.CorsPolicy;
import io.mateu.core.infra.versioning.AppBuild;
import io.mateu.core.infra.versioning.RendererCompatibility;
import io.micronaut.core.order.Ordered;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ResponseFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.http.filter.ServerFilterPhase;

/**
 * The version headers of Mateu's endpoints on Micronaut: every response carries the build id
 * ({@link AppBuild#HEADER}) — refusals and errors included — and the renderer a request names
 * ({@link RendererCompatibility#HEADER}) is checked against this server's wire major.
 */
@ServerFilter(ServerFilter.MATCH_ALL_PATTERN)
public class MateuVersionHeadersServerFilter implements Ordered {

  @Override
  public int getOrder() {
    return ServerFilterPhase.FIRST.before();
  }

  @RequestFilter
  public void renderer(HttpRequest<?> request) {
    if (CorsPolicy.appliesTo(request.getPath())) {
      RendererCompatibility.check(request.getHeaders().get(RendererCompatibility.HEADER));
    }
  }

  @ResponseFilter
  public void build(HttpRequest<?> request, MutableHttpResponse<?> response) {
    if (!CorsPolicy.appliesTo(request.getPath())) {
      return;
    }
    var build = AppBuild.id();
    if (build != null) {
      response.header(AppBuild.HEADER, build);
    }
  }
}
