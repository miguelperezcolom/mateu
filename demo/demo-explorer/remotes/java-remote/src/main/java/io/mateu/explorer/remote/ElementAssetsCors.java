package io.mateu.explorer.remote;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Mateu's CORS ({@code mateu.cors.allowed-origins}) covers Mateu's endpoints only. A screen of this
 * remote shown inside another origin's shell loads its custom element's module ({@code Element}
 * with {@code import: /inventory-assets/remote-badge.js}) from THIS origin — the renderer re-points
 * a root-relative import at the remote — so that path must be opened to the shell's origin too: an
 * ES module import is a CORS request.
 */
@Configuration
public class ElementAssetsCors implements WebMvcConfigurer {

  @Value("${mateu.cors.allowed-origins}")
  String allowedOrigins;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
        .addMapping("/inventory-assets/**")
        .allowedOrigins(allowedOrigins.split("\\s*,\\s*"))
        .allowedMethods("GET");
  }
}
