package io.mateu.mdd.demovbpms.infra;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS abierto: el bridge JS del renderer VB corre en otro origen (preview de VB Studio u
 * Oracle-hosted) y consume la API /mateu/v3 de este backend con fetch/Service Connection.
 *
 * <p>allowedOriginPatterns, NO allowedOrigins("*"): el preflight de /mateu/v3/sse/** casa con dos
 * mappings (v3/sse/** y v3/**) y Spring lo contesta con su config de preflight ambiguo, que permite
 * credenciales — combinada con un origen "*" literal es inválida y el preflight respondía 500, así
 * que ninguna acción SSE (un LongTask) funcionaba desde otro origen.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**").allowedOriginPatterns("*").allowedMethods("*").allowedHeaders("*");
  }
}
