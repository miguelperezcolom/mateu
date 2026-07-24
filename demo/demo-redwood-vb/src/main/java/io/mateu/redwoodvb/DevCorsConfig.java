package io.mateu.redwoodvb;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Local-dev CORS: the VB bridge kit (and the {@code apps/redwood-vb} dev harness) run on a different
 * origin than this backend, so the browser needs CORS to POST to {@code /mateu/**}. This is a
 * development convenience for the SUT; a production VB app calls Mateu through a Service Connection
 * (server-to-server), where CORS does not apply.
 */
@Configuration
public class DevCorsConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
        .addMapping("/mateu/**")
        .allowedOriginPatterns("*")
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        .allowedHeaders("*");
  }
}
