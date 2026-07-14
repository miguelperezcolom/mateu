package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record ResourceGridDto(
    String actionId, int columns, String recommendedLabel, List<ResourceItemDto> items)
    implements ComponentMetadataDto {

  public ResourceGridDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<ResourceItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
