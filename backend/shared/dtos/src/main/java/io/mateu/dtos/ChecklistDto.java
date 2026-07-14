package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record ChecklistDto(String title, List<ChecklistItemDto> items)
    implements ComponentMetadataDto {

  public ChecklistDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<ChecklistItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
