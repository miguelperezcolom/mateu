package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/** Metadata for a html element */
public record ElementDto(String name, Map<String, String> attributes, String content)
    implements ComponentMetadataDto {

  public ElementDto {
    attributes = attributes != null ? Collections.unmodifiableMap(attributes) : Map.of();
  }

  @Override
  public Map<String, String> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}
