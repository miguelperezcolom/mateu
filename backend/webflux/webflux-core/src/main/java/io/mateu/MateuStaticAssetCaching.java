package io.mateu;

import io.mateu.core.infra.StaticAssetCaching;
import java.io.IOException;
import java.util.Arrays;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.reactive.config.ResourceHandlerRegistration;
import org.springframework.web.reactive.config.ResourceHandlerRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

/**
 * Serves Mateu's frontend assets with a cache policy, so Spring Security's default {@code no-store}
 * does not make the browser download every bundle on every page load. See {@link
 * StaticAssetCaching} for the policy; the handlers resolve from the same locations as Spring Boot's
 * default static handler ({@code spring.web.resources.static-locations}), and being more specific
 * than its {@code /**} they take precedence only for these paths.
 */
@Configuration
@ConditionalOnProperty(
    name = StaticAssetCaching.ENABLED_PROPERTY,
    havingValue = "true",
    matchIfMissing = true)
public class MateuStaticAssetCaching implements WebFluxConfigurer {

  private final String[] locations;

  public MateuStaticAssetCaching(Environment environment) {
    this.locations =
        environment.getProperty(
            "spring.web.resources.static-locations",
            String[].class,
            StaticAssetCaching.DEFAULT_LOCATIONS.toArray(String[]::new));
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // /version_<n>/… keeps its first segment in the path it resolves (it holds the wildcard), so
    // it is served from the static locations themselves.
    configure(
        registry.addResourceHandler(StaticAssetCaching.IMMUTABLE_PATTERNS.toArray(String[]::new)),
        locations,
        CacheControl.maxAge(StaticAssetCaching.IMMUTABLE_MAX_AGE).cachePublic().immutable());
    // /assets/** resolves "x.js" for /assets/x.js, so it is served from each location's assets/.
    for (String folder : StaticAssetCaching.REVALIDATE_FOLDERS) {
      configure(
          registry.addResourceHandler("/" + folder + "/**"),
          Arrays.stream(locations)
              .map(location -> (location.endsWith("/") ? location : location + "/") + folder + "/")
              .toArray(String[]::new),
          CacheControl.noCache());
    }
  }

  private void configure(
      ResourceHandlerRegistration registration, String[] locations, CacheControl cacheControl) {
    registration
        .addResourceLocations(locations)
        .setCacheControl(cacheControl)
        .setUseLastModified(true)
        .setEtagGenerator(MateuStaticAssetCaching::etag);
  }

  static String etag(Resource resource) {
    try {
      return StaticAssetCaching.weakEtag(resource.contentLength(), resource.lastModified());
    } catch (IOException e) {
      return null;
    }
  }
}
