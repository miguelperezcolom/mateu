package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record KanbanDto(List<KanbanColumnDto> columns) implements ComponentMetadataDto {

  public KanbanDto {
    columns = Collections.unmodifiableList(columns != null ? columns : Collections.emptyList());
  }

  @Override
  public List<KanbanColumnDto> columns() {
    return Collections.unmodifiableList(columns);
  }
}
