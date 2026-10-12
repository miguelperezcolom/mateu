package com.acme.pms;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The console's process diagram is a custom element whose module EventConductor serves at {@code
 * /eventconductor/workflow-graph.js}. A federated shell's browser loads that module from THIS
 * origin (Mateu resolves a remote screen's root-relative module url against the remote), and a
 * module script is always fetched with CORS — so the shells that may compose the console get it
 * too. Mateu's own CORS filter covers only its endpoints ({@code /mateu/**}); the assets a UI
 * module serves are the module's to open.
 *
 * <p>This belongs in EventConductor itself (see design/readiness/eventconductor-uis.md); it is here
 * so the demo shows the diagram under a federated shell today.
 */
@Configuration
public class ConsoleAssetsCors implements WebMvcConfigurer {

  @Value("${mateu.cors.allowed-origins:}")
  String allowedOrigins;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    if (!allowedOrigins.isBlank()) {
      registry
          .addMapping("/eventconductor/**")
          .allowedOrigins(allowedOrigins.split("\\s*,\\s*"))
          .allowedMethods("GET");
    }
  }
}
