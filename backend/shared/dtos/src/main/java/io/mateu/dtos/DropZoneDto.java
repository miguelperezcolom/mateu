package io.mateu.dtos;

import java.util.Map;
import lombok.Builder;

@Builder
public record DropZoneDto(
    String accept, String actionId, Map<String, Object> parameters, String title, String subtitle)
    implements ComponentMetadataDto {

  public DropZoneDto {
    parameters = parameters != null ? Map.copyOf(parameters) : Map.of();
  }
}
