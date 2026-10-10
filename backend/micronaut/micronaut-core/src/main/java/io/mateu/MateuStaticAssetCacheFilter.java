package io.mateu;

import io.mateu.core.infra.StaticAssetCaching;
import io.micronaut.context.annotation.Requires;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.ResponseFilter;
import io.micronaut.http.annotation.ServerFilter;

/**
 * Mateu's asset cache policy ({@link StaticAssetCaching}) on Micronaut: content-versioned Redwood
 * bundles ({@code /version_<n>/…}) are immutable, fixed-name assets ({@code /assets/…}) are kept
 * and revalidated. Without it a static handler (or a security layer) decides on its own, and the
 * browser downloads every bundle on every page load. Off with {@code
 * mateu.static-assets.caching=false}; a response that already carries a policy is left alone.
 */
@ServerFilter(ServerFilter.MATCH_ALL_PATTERN)
@Requires(property = StaticAssetCaching.ENABLED_PROPERTY, notEquals = "false")
public class MateuStaticAssetCacheFilter {

  @ResponseFilter
  public void cacheControl(HttpRequest<?> request, MutableHttpResponse<?> response) {
    var status = response.getStatus();
    if (status != HttpStatus.OK && status != HttpStatus.NOT_MODIFIED) {
      return;
    }
    String policy = StaticAssetCaching.cacheControlFor(request.getPath());
    if (policy != null) {
      response.getHeaders().set("Cache-Control", policy);
    }
  }
}
