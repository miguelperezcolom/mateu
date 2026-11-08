package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.zip.GZIPInputStream;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.AbstractResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.servlet.resource.HttpResource;
import org.springframework.web.servlet.resource.ResourceResolverChain;

/**
 * The resource the chain resolves, as the browser gets it: gzipped when it accepts gzip, as it is
 * otherwise — always with {@code Vary: Accept-Encoding} — and untouched when it is not text.
 */
class MateuGzipAssetResolverTest {

  private static final String LARGE = "/assets/large.js";
  private final MateuGzipAssetResolver resolver = new MateuGzipAssetResolver();

  private static ResourceResolverChain chainAnswering(Resource resource) {
    return new ResourceResolverChain() {
      @Override
      public Resource resolveResource(
          HttpServletRequest request, String requestPath, List<? extends Resource> locations) {
        return resource;
      }

      @Override
      public String resolveUrlPath(String resourcePath, List<? extends Resource> locations) {
        return "/resolved" + resourcePath;
      }
    };
  }

  private static Resource large() {
    return new ClassPathResource("static" + LARGE);
  }

  private static MockHttpServletRequest request(String acceptEncoding) {
    var request = new MockHttpServletRequest("GET", LARGE);
    if (acceptEncoding != null) {
      request.addHeader(HttpHeaders.ACCEPT_ENCODING, acceptEncoding);
    }
    return request;
  }

  private Resource resolve(HttpServletRequest request, String path, Resource resource) {
    return resolver.resolveResource(request, path, List.of(), chainAnswering(resource));
  }

  private static byte[] gunzip(InputStream in) throws IOException {
    try (var gz = new GZIPInputStream(in)) {
      var out = new ByteArrayOutputStream();
      gz.transferTo(out);
      return out.toByteArray();
    }
  }

  @Test
  void aBrowserAcceptingGzipGetsTheCompressedBytesUnderTheAssetsOwnName() throws Exception {
    var original = large();
    var answered = resolve(request("gzip, deflate, br"), LARGE, original);

    assertThat(answered).isInstanceOf(MateuGzipAssetResolver.Negotiated.class);
    assertThat(answered.contentLength()).isLessThan(original.contentLength());
    assertThat(gunzip(answered.getInputStream())).isEqualTo(original.getContentAsByteArray());
    assertThat(answered.getFilename()).isEqualTo("large.js");
    assertThat(answered.getDescription()).startsWith("gzip ");
    assertThat(answered.getURL()).isEqualTo(original.getURL());
    assertThat(answered.lastModified()).isEqualTo(original.lastModified());
    assertThat(answered.exists()).isTrue();
    assertThat(answered.isReadable()).isTrue();
    var headers = ((HttpResource) answered).getResponseHeaders();
    assertThat(headers.getFirst(HttpHeaders.CONTENT_ENCODING)).isEqualTo("gzip");
    assertThat(headers.getFirst(HttpHeaders.VARY)).isEqualTo(HttpHeaders.ACCEPT_ENCODING);
  }

  @Test
  void aBrowserNotAcceptingGzipGetsTheAssetAsItIsButStillVaried() throws Exception {
    var original = large();
    var answered = resolve(request(null), LARGE, original);

    assertThat(answered).isInstanceOf(MateuGzipAssetResolver.Negotiated.class);
    assertThat(answered.contentLength()).isEqualTo(original.contentLength());
    assertThat(answered.getInputStream().readAllBytes())
        .isEqualTo(original.getContentAsByteArray());
    assertThat(answered.getDescription()).isEqualTo(original.getDescription());
    var headers = ((HttpResource) answered).getResponseHeaders();
    assertThat(headers.containsHeader(HttpHeaders.CONTENT_ENCODING)).isFalse();
    assertThat(headers.getFirst(HttpHeaders.VARY)).isEqualTo(HttpHeaders.ACCEPT_ENCODING);
    // without a request there is nothing to negotiate with: served as it is
    assertThat(resolve(null, LARGE, original).contentLength()).isEqualTo(original.contentLength());
  }

  @Test
  void anOriginalCarryingItsOwnHeadersKeepsThem() {
    var withHeaders = new HeaderedResource(large());
    var answered = (HttpResource) resolve(request(null), LARGE, withHeaders);
    var headers = answered.getResponseHeaders();
    assertThat(headers.getFirst("X-Own")).isEqualTo("kept");
    assertThat(headers.getFirst(HttpHeaders.VARY)).isEqualTo(HttpHeaders.ACCEPT_ENCODING);
  }

  @Test
  void nothingResolvedOrNotTextIsLeftAlone() {
    assertThat(resolve(request("gzip"), LARGE, null)).isNull();
    var image = new ClassPathResource("static" + LARGE);
    assertThat(resolve(request("gzip"), "/assets/logo.png", image)).isSameAs(image);
  }

  @Test
  void aResourceThatCannotBeReadIsAnsweredAsItIs() {
    var broken =
        new AbstractResource() {
          @Override
          public String getDescription() {
            return "broken";
          }

          @Override
          public InputStream getInputStream() throws IOException {
            throw new IOException("gone");
          }

          @Override
          public long contentLength() throws IOException {
            throw new IOException("gone");
          }
        };
    assertThat(resolve(request("gzip"), LARGE, broken)).isSameAs(broken);
  }

  @Test
  void theUrlPathIsTheChains() {
    assertThat(resolver.resolveUrlPath(LARGE, List.of(), chainAnswering(null)))
        .isEqualTo("/resolved" + LARGE);
  }

  @Test
  void twoAnswersAreEqualWhenTheyAreTheSameAssetEncodedTheSameWay() {
    var original = large();
    var plain = new MateuGzipAssetResolver.Negotiated(original, null);
    var gzip = new MateuGzipAssetResolver.Negotiated(original, new byte[] {1});
    assertThat(plain).isEqualTo(new MateuGzipAssetResolver.Negotiated(original, null));
    assertThat(plain.hashCode())
        .isEqualTo(new MateuGzipAssetResolver.Negotiated(original, null).hashCode());
    assertThat(plain).isNotEqualTo(gzip);
    assertThat(plain.hashCode()).isNotEqualTo(gzip.hashCode());
    assertThat(plain).isNotEqualTo(original);
  }

  /** A resolved resource that already answers headers of its own (a versioned one, say). */
  private static final class HeaderedResource extends AbstractResource implements HttpResource {
    private final Resource delegate;

    HeaderedResource(Resource delegate) {
      this.delegate = delegate;
    }

    @Override
    public String getDescription() {
      return delegate.getDescription();
    }

    @Override
    public InputStream getInputStream() throws IOException {
      return delegate.getInputStream();
    }

    @Override
    public long contentLength() throws IOException {
      return delegate.contentLength();
    }

    @Override
    public HttpHeaders getResponseHeaders() {
      var headers = new HttpHeaders();
      headers.set("X-Own", "kept");
      return headers;
    }
  }
}
