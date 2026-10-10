package io.mateu;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.WireMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Mateu's wire ObjectMapper, as a bean named {@value #BEAN_NAME}.
 *
 * <p>It used to be a public bean named {@code objectMapper} — the very name of the application's
 * own one — so it replaced (or collided with) whatever the application configured. It is now
 * namespaced and NOT a default autowire candidate: an unqualified {@code ObjectMapper} injection
 * point in the application never receives it; Mateu code that wants it asks for it by name
 * ({@code @Qualifier("mateuObjectMapper")}).
 */
@Configuration
public class SerializationConfiguration {

  public static final String BEAN_NAME = "mateuObjectMapper";

  @Bean(name = BEAN_NAME, defaultCandidate = false)
  public ObjectMapper mateuObjectMapper() {
    return WireMapper.create();
  }
}
