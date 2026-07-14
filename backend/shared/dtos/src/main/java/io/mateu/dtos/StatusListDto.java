package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record StatusListDto(List<StatusItemDto> items) implements ComponentMetadataDto {

  public StatusListDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<StatusItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
