package io.mateu;

import io.mateu.core.infra.ClasspathAssets;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ServerFilter;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import java.io.IOException;

/**
 * Serves the renderer's assets ({@link ClasspathAssets}: {@code /assets/…}, {@code /_redwood/…},
 * {@code /version_<n>/…}…) from the {@code static/} folder of the renderer jar, so a Micronaut app
 * needs no {@code micronaut.router.static-resources} entry for them — the same contract as the
 * Quarkus adapter. A filter rather than a controller: it answers before routing, so the controllers
 * generated for each {@code @UI} (whose deep-link routes match any path) never compete with it, and
 * a path that is not one of Mateu's assets goes on untouched (to the app's own static resources, if
 * it maps any). ETag / Last-Modified revalidation answers 304; Netty compresses the text assets on
 * the way out and {@link MateuStaticAssetCacheFilter} adds the cache policy.
 */
@ServerFilter({"/assets/**", "/js/**", "/myassets/**", "/_redwood/**", "/version_*/**"})
public class MateuRendererAssetsFilter {

  @RequestFilter
  @ExecuteOn(TaskExecutors.BLOCKING)
  @Nullable
  public HttpResponse<?> serve(HttpRequest<?> request) {
    HttpMethod method = request.getMethod();
    if (method != HttpMethod.GET && method != HttpMethod.HEAD) {
      return null;
    }
    var asset =
        ClasspathAssets.find(Thread.currentThread().getContextClassLoader(), request.getPath());
    if (asset == null) {
      return null;
    }
    var headers = request.getHeaders();
    String etag = asset.etag();
    MutableHttpResponse<?> response;
    if (asset.notModified(headers.get("If-None-Match"), headers.get("If-Modified-Since"), etag)) {
      response = HttpResponse.notModified();
    } else {
      try {
        response = HttpResponse.ok(asset.read());
      } catch (IOException e) {
        return null;
      }
      String contentType = asset.contentType();
      if (contentType != null) {
        response.contentType(contentType);
      }
    }
    if (etag != null) {
      response.header("ETag", etag);
    }
    String lastModified = asset.lastModifiedHeader();
    if (lastModified != null) {
      response.header("Last-Modified", lastModified);
    }
    return response;
  }
}
