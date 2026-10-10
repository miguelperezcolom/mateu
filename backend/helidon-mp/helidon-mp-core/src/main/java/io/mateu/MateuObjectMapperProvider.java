package io.mateu;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.WireMapper;
import jakarta.ws.rs.ext.ContextResolver;
import jakarta.ws.rs.ext.Provider;

/**
 * Makes Helidon MP (Jersey) serialize the Mateu wire DTOs with Jackson instead of the default
 * JSON-B (Yasson). The DTOs are polymorphic via Jackson's {@code @JsonTypeInfo(property = "type")};
 * JSON-B ignores those annotations and drops the {@code "type"} discriminators, so the frontend
 * receives untyped components and renders nothing. This provider (paired with the Jackson JAX-RS
 * feature) restores the correct wire shape and uses the wire ObjectMapper of every other adapter
 * ({@link WireMapper}).
 */
@Provider
public class MateuObjectMapperProvider implements ContextResolver<ObjectMapper> {

  private final ObjectMapper mapper = WireMapper.create();

  @Override
  public ObjectMapper getContext(Class<?> type) {
    return mapper;
  }
}
