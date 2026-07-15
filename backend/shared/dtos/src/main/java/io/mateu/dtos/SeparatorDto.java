package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/** A horizontal divider line ({@code <hr>}) separating contents inside a section or form. */
public record SeparatorDto(Map<String, String> attributes) implements ComponentMetadataDto {

  public SeparatorDto {
    attributes = attributes != null ? Collections.unmodifiableMap(attributes) : Map.of();
  }

  @Override
  public Map<String, String> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}
