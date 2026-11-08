package io.mateu;

import io.mateu.core.infra.AssetCompression;
import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import org.springframework.core.io.AbstractResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.web.servlet.resource.AbstractResourceResolver;
import org.springframework.web.servlet.resource.HttpResource;
import org.springframework.web.servlet.resource.ResourceResolverChain;

/**
 * Answers Mateu's text assets gzipped when the browser accepts it ({@link AssetCompression}): the
 * resource the chain resolves is swapped for its compressed bytes, cached once per process. Every
 * compressible asset carries {@code Vary: Accept-Encoding}.
 */
class MateuGzipAssetResolver extends AbstractResourceResolver {

  @Override
  protected Resource resolveResourceInternal(
      HttpServletRequest request,
      String requestPath,
      List<? extends Resource> locations,
      ResourceResolverChain chain) {
    Resource resource = chain.resolveResource(request, requestPath, locations);
    if (resource == null || !AssetCompression.compressible(requestPath)) {
      return resource;
    }
    try {
      long length = resource.contentLength();
      boolean gzip =
          request != null
              && AssetCompression.shouldGzip(
                  AssetCompression.enabled(),
                  requestPath,
                  length,
                  request.getHeader(HttpHeaders.ACCEPT_ENCODING));
      if (!gzip) {
        return new Negotiated(resource, null);
      }
      byte[] gz =
          AssetCompression.gzipped(
              resource.getURL().toString(),
              length,
              resource.lastModified(),
              resource::getContentAsByteArray);
      return new Negotiated(resource, gz);
    } catch (IOException | RuntimeException e) {
      return resource;
    }
  }

  @Override
  protected String resolveUrlPathInternal(
      String resourceUrlPath, List<? extends Resource> locations, ResourceResolverChain chain) {
    return chain.resolveUrlPath(resourceUrlPath, locations);
  }

  /** The resolved asset as it is answered: its gzip bytes, or itself, plus the headers. */
  static final class Negotiated extends AbstractResource implements HttpResource {
    private final Resource original;
    private final byte[] gzip;

    Negotiated(Resource original, byte[] gzip) {
      this.original = original;
      this.gzip = gzip;
    }

    @Override
    public InputStream getInputStream() throws IOException {
      return gzip != null ? new ByteArrayInputStream(gzip) : original.getInputStream();
    }

    @Override
    public long contentLength() throws IOException {
      return gzip != null ? gzip.length : original.contentLength();
    }

    @Override
    public long lastModified() throws IOException {
      return original.lastModified();
    }

    @Override
    public boolean exists() {
      return original.exists();
    }

    @Override
    public boolean isReadable() {
      return original.isReadable();
    }

    @Override
    public java.net.URL getURL() throws IOException {
      return original.getURL();
    }

    @Override
    public String getFilename() {
      // the content type is derived from the name: still the asset's, not "x.js.gz"
      return original.getFilename();
    }

    @Override
    public String getDescription() {
      return (gzip != null ? "gzip " : "") + original.getDescription();
    }

    @Override
    public HttpHeaders getResponseHeaders() {
      HttpHeaders headers =
          original instanceof HttpResource http ? http.getResponseHeaders() : new HttpHeaders();
      if (gzip != null) {
        headers.set(HttpHeaders.CONTENT_ENCODING, "gzip");
      }
      headers.set(HttpHeaders.VARY, HttpHeaders.ACCEPT_ENCODING);
      return headers;
    }

    @Override
    public boolean equals(Object other) {
      return other instanceof Negotiated n
          && n.original.equals(original)
          && (n.gzip == null) == (gzip == null);
    }

    @Override
    public int hashCode() {
      return original.hashCode() * 31 + (gzip == null ? 0 : 1);
    }
  }
}
