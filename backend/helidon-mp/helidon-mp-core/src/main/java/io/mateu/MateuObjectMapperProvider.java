package io.mateu;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

/**
 * Makes Helidon MP (Jersey) serialize the Mateu wire DTOs with Jackson instead of the default
 * JSON-B (Yasson). The DTOs are polymorphic via Jackson's {@code @JsonTypeInfo(property = "type")};
 * JSON-B ignores those annotations and drops the {@code "type"} discriminators, so the frontend
 * receives untyped components and renders nothing. This provider (paired with the Jackson JAX-RS
 * feature) restores the correct wire shape and mirrors the ObjectMapper config used by mateu core.
 */
@Provider
public class MateuObjectMapperProvider implements ContextResolver<ObjectMapper> {

  private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

  @Override
  public ObjectMapper getContext(Class<?> type) {
    return mapper;
  }
}
